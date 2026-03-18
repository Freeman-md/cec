import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CW1 scaffold", function () {
  async function deployFixture() {
    const [admin, organizer, student] = await ethers.getSigners();

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

    return { admin, organizer, student, creditsToken, ticketNFT, treasuryVault, eventPlatform };
  }

  it("wires the platform to the token, ticket, and treasury contracts", async function () {
    const { admin, creditsToken, ticketNFT, treasuryVault, eventPlatform } = await deployFixture();

    expect(await eventPlatform.admin()).to.equal(admin.address);
    expect(await creditsToken.platform()).to.equal(eventPlatform.target);
    expect(await ticketNFT.platform()).to.equal(eventPlatform.target);
    expect(await treasuryVault.platform()).to.equal(eventPlatform.target);
  });

  it("allows the admin to approve an organizer and the organizer to create a draft event", async function () {
    const { admin, organizer, eventPlatform } = await deployFixture();

    await expect(eventPlatform.connect(admin).approveOrganizer(organizer.address, true))
      .to.emit(eventPlatform, "OrganizerApprovalUpdated")
      .withArgs(organizer.address, true);

    await expect(eventPlatform.connect(organizer).createEvent())
      .to.emit(eventPlatform, "EventCreated")
      .withArgs(1n, organizer.address);

    const eventRecord = await eventPlatform.events(1n);
    expect(eventRecord.organizer).to.equal(organizer.address);
    expect(eventRecord.state).to.equal(0n);
  });

  it("mints credits when a student buys them with ETH", async function () {
    const { student, creditsToken, eventPlatform } = await deployFixture();
    const ethSpent = ethers.parseEther("1");
    const expectedCredits = ethSpent * 100n;

    await expect(eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent }))
      .to.emit(eventPlatform, "CreditsPurchased")
      .withArgs(student.address, ethSpent, expectedCredits);

    expect(await creditsToken.balanceOf(student.address)).to.equal(expectedCredits);
  });

  it("lets a student obtain a ticket with credits and records the sale", async function () {
    const { admin, organizer, student, creditsToken, ticketNFT, treasuryVault, eventPlatform } = await deployFixture();

    await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
    await eventPlatform.connect(organizer).createEvent();
    await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", 200n, 2n);
    await eventPlatform.connect(organizer).setPerEventWalletCap(1n, 1n);
    await eventPlatform.connect(organizer).startTicketSales(1n);

    await eventPlatform.connect(student).buyCreditsWithEth({ value: 2n });
    await creditsToken.connect(student).approve(eventPlatform.target, 200n);

    await expect(eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n))
      .to.emit(eventPlatform, "TicketObtained")
      .withArgs(1n, 1n, 1n, student.address, 200n);

    expect(await treasuryVault.paidCreditsByEvent(1n)).to.equal(200n);
    expect(await ticketNFT.ownerOf(1n)).to.equal(student.address);
    expect(await eventPlatform.walletPurchases(1n, student.address)).to.equal(1n);
  });
});
