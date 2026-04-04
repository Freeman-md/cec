import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Security misuse coverage", function () {
  async function deployFixture() {
    const [admin, organizer, attacker, student, otherStudent] = await ethers.getSigners();

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

    return { admin, organizer, attacker, student, otherStudent, creditsToken, ticketNFT, treasuryVault, eventPlatform };
  }

  describe("access-control misuse", function () {
    it("rejects organiser approval from a non-owner", async function () {
      const { organizer, attacker, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(attacker).approveOrganizer(organizer.address, true)).to.be.revertedWithCustomError(
        eventPlatform,
        "OwnableUnauthorizedAccount",
      );
    });

    it("rejects event creation from an unapproved organiser", async function () {
      const { organizer, eventPlatform } = await deployFixture();

      await expect(eventPlatform.connect(organizer).createEvent()).to.be.revertedWithCustomError(
        eventPlatform,
        "NotApprovedOrganizer",
      );
    });

    it("rejects ticket-tier configuration from a non-organiser", async function () {
      const { admin, organizer, attacker, eventPlatform } = await deployFixture();
      const creditsPrice = ethers.parseUnits("200", 18);

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
      await eventPlatform.connect(organizer).createEvent();

      await expect(
        eventPlatform.connect(attacker).createTicketTier(1n, "Standard", creditsPrice, 2n),
      ).to.be.revertedWithCustomError(eventPlatform, "NotEventOrganizer");
    });
  });

  describe("purchase-abuse misuse", function () {
    it("rejects ticket purchase before sales start", async function () {
      const { admin, organizer, student, creditsToken, eventPlatform } = await deployFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("2");

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
      await eventPlatform.connect(organizer).createEvent();
      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);

      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);

      await expect(eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n)).to.be.revertedWithCustomError(
        eventPlatform,
        "InvalidEventState",
      );
    });

    it("rejects a second ticket purchase once the wallet cap is reached", async function () {
      const { admin, organizer, student, creditsToken, eventPlatform } = await deployFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("4");

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
      await eventPlatform.connect(organizer).createEvent();
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
  });

  describe("ticket-resale misuse", function () {
    it("rejects direct transfer attempts for issued tickets", async function () {
      const { admin, organizer, student, otherStudent, creditsToken, ticketNFT, eventPlatform } = await deployFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("2");

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
      await eventPlatform.connect(organizer).createEvent();
      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
      await eventPlatform.connect(organizer).startTicketSales(1n);

      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);
      await eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n);

      await expect(
        ticketNFT.connect(student).transferFrom(student.address, otherStudent.address, 1n),
      ).to.be.revertedWithCustomError(ticketNFT, "NonTransferable");
    });

    it("rejects approval-based resale setup for issued tickets", async function () {
      const { admin, organizer, student, otherStudent, creditsToken, ticketNFT, eventPlatform } = await deployFixture();
      const creditsPrice = ethers.parseUnits("200", 18);
      const ethSpent = ethers.parseEther("2");

      await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
      await eventPlatform.connect(organizer).createEvent();
      await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
      await eventPlatform.connect(organizer).startTicketSales(1n);

      await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
      await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);
      await eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n);

      await expect(ticketNFT.connect(student).approve(otherStudent.address, 1n)).to.be.revertedWithCustomError(
        ticketNFT,
        "NonTransferable",
      );
    });
  });
});
