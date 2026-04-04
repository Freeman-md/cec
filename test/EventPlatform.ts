import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("EventPlatform", function () {
  async function deployFixture() {
    const [admin, organizer, student, otherStudent] = await ethers.getSigners();

    const creditsToken = await ethers.deployContract("CreditsToken", [admin.address]);
    const ticketNFT = await ethers.deployContract("TicketNFT", [admin.address]);
    const treasuryVault = await ethers.deployContract("TreasuryVault", [admin.address]);
    const eventPlatform = await ethers.deployContract("EventPlatform", [
      admin.address,
      creditsToken.target,
      ticketNFT.target,
      treasuryVault.target,
      100n,
    ]);

    await creditsToken.connect(admin).setPlatform(eventPlatform.target);
    await ticketNFT.connect(admin).setPlatform(eventPlatform.target);
    await treasuryVault.connect(admin).setPlatform(eventPlatform.target);

    return { admin, organizer, student, otherStudent, creditsToken, ticketNFT, treasuryVault, eventPlatform };
  }

  async function createSaleFixture() {
    const fixture = await deployFixture();
    const { admin, organizer, eventPlatform } = fixture;

    await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
    await eventPlatform.connect(organizer).createEvent();

    return fixture;
  }

  describe("administration", function () {
    it("allows the owner to approve an organiser", async function () {
      const { admin, organizer, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(admin).approveOrganizer(organizer.address, true))
        .to.emit(eventPlatform, "OrganizerApprovalUpdated")
        .withArgs(organizer.address, true);

      expect(await eventPlatform.approvedOrganizers(organizer.address)).to.equal(true);
    });

    it("allows only the owner to update the ETH-to-credit rate", async function () {
      const { admin, organizer, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(organizer).updateEthToCreditsRate(150n)).to.be.revertedWithCustomError(
        eventPlatform,
        "OwnableUnauthorizedAccount",
      );

      await expect(eventPlatform.connect(admin).updateEthToCreditsRate(150n))
        .to.emit(eventPlatform, "EthToCreditsRateUpdated")
        .withArgs(100n, 150n);

      expect(await eventPlatform.ethToCreditsRate()).to.equal(150n);
    });

    it("rejects zero when updating the ETH-to-credit rate", async function () {
      const { admin, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(admin).updateEthToCreditsRate(0n)).to.be.revertedWithCustomError(
        eventPlatform,
        "InvalidRate",
      );
    });
  });

  describe("organiser event configuration", function () {
    it("lets an approved organiser create an event in draft state", async function () {
      const { admin, organizer, eventPlatform } = await deployFixture();

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);

      await expect(eventPlatform.connect(organizer).createEvent())
        .to.emit(eventPlatform, "EventCreated")
        .withArgs(1n, organizer.address);

      const eventData = await eventPlatform.events(1n);

      expect(eventData.eventId).to.equal(1n);
      expect(eventData.organizer).to.equal(organizer.address);
      expect(eventData.state).to.equal(0n);
      expect(eventData.walletCap).to.equal(1n);
    });

    it("lets the event organiser create a ticket tier in draft state", async function () {
      const { organizer, eventPlatform } = await createSaleFixture();
      const creditsPrice = ethers.parseUnits("200", 18);

      await expect(eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n))
        .to.emit(eventPlatform, "TicketTierCreated")
        .withArgs(1n, 1n, "Standard", creditsPrice, 2n);

      const tier = await eventPlatform.ticketTiers(1n, 1n);

      expect(tier.tierId).to.equal(1n);
      expect(tier.eventId).to.equal(1n);
      expect(tier.label).to.equal("Standard");
      expect(tier.priceInCredits).to.equal(creditsPrice);
      expect(tier.maxSupply).to.equal(2n);
      expect(tier.soldCount).to.equal(0n);
    });

    it("lets the event organiser set a per-event wallet cap in draft state", async function () {
      const { organizer, eventPlatform } = await createSaleFixture();

      await expect(eventPlatform.connect(organizer).setPerEventWalletCap(1n, 3n))
        .to.emit(eventPlatform, "WalletCapUpdated")
        .withArgs(1n, 3n);

      const eventData = await eventPlatform.events(1n);

      expect(eventData.walletCap).to.equal(3n);
    });

    it("lets the event organiser start ticket sales after draft configuration", async function () {
      const { organizer, eventPlatform } = await createSaleFixture();
      const creditsPrice = ethers.parseUnits("200", 18);

      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
      await eventPlatform.connect(organizer).setPerEventWalletCap(1n, 2n);

      await expect(eventPlatform.connect(organizer).startTicketSales(1n))
        .to.emit(eventPlatform, "TicketSalesStarted")
        .withArgs(1n);

      const eventData = await eventPlatform.events(1n);

      expect(eventData.state).to.equal(1n);
    });
  });

  describe("credit purchase flow", function () {
    it("mints credits at the configured fixed rate when ETH is paid", async function () {
      const { student, creditsToken, eventPlatform } = await deployFixture();
      const ethSpent = ethers.parseEther("1");
      const expectedCredits = ethSpent * 100n;

      await expect(eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent }))
        .to.emit(eventPlatform, "CreditsPurchased")
        .withArgs(student.address, ethSpent, expectedCredits);

      expect(await creditsToken.balanceOf(student.address)).to.equal(expectedCredits);
    });

    it("rejects zero-value credit purchases", async function () {
      const { student, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(student).buyCreditsWithEth({ value: 0n })).to.be.revertedWithCustomError(
        eventPlatform,
        "ZeroValue",
      );
    });
  });

  describe("ticket sales flow", function () {
    it("rejects ticket purchases before sales start", async function () {
      const { organizer, student, creditsToken, eventPlatform } = await createSaleFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("2");

      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);

      await expect(eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n)).to.be.revertedWithCustomError(
        eventPlatform,
        "InvalidEventState",
      );
    });

    it("enforces the per-event wallet cap", async function () {
      const { organizer, student, creditsToken, eventPlatform } = await createSaleFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("4");

      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 3n);
      await eventPlatform.connect(organizer).setPerEventWalletCap(1n, 1n);
      await eventPlatform.connect(organizer).startTicketSales(1n);

      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice * 2n);

      await eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n);

      await expect(eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n)).to.be.revertedWithCustomError(
        eventPlatform,
        "WalletCapExceeded",
      );
    });

    it("marks the event as sold out when the final ticket is purchased", async function () {
      const { organizer, student, otherStudent, creditsToken, treasuryVault, ticketNFT, eventPlatform } =
        await createSaleFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("2");

      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
      await eventPlatform.connect(organizer).setPerEventWalletCap(1n, 2n);
      await eventPlatform.connect(organizer).startTicketSales(1n);

      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await eventPlatform.connect(otherStudent).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);
      await creditsToken.connect(otherStudent).approve(eventPlatform.target, creditsPrice);

      await eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n);
      await expect(eventPlatform.connect(otherStudent).obtainTicketWithCredits(1n, 1n))
        .to.emit(eventPlatform, "TicketObtained")
        .withArgs(1n, 1n, 2n, otherStudent.address, creditsPrice);

      const eventData = await eventPlatform.events(1n);

      expect(eventData.state).to.equal(2n);
      expect(await treasuryVault.paidCreditsByEvent(1n)).to.equal(creditsPrice * 2n);
      expect(await ticketNFT.ownerOf(2n)).to.equal(otherStudent.address);
    });
  });
});
