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

  it("allows the admin to approve an organizer", async function () {
    const { admin, organizer, eventPlatform } = await deployFixture();

    await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);

    expect(await eventPlatform.approvedOrganizers(organizer.address)).to.equal(true);
  });

  it("mints credits when a student buys them with ETH", async function () {
    const { student, creditsToken, eventPlatform } = await deployFixture();
    const ethSpent = ethers.parseEther("1");
    const expectedCredits = ethSpent * 100n;

    await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });

    expect(await creditsToken.balanceOf(student.address)).to.equal(expectedCredits);
  });

  it("lets a student obtain a ticket with credits and records the sale", async function () {
    const { admin, organizer, student, creditsToken, ticketNFT, treasuryVault, eventPlatform } = await deployFixture();
    const creditsPrice = ethers.parseUnits("200", 18);
    const ethSpent = ethers.parseEther("2");

    await eventPlatform.connect(admin).approveOrganizer(organizer.address, true);
    await eventPlatform.connect(organizer).createEvent();
    await eventPlatform.connect(organizer).createTicketTier(1n, "Standard", creditsPrice, 2n);
    await eventPlatform.connect(organizer).setPerEventWalletCap(1n, 1n);
    await eventPlatform.connect(organizer).startTicketSales(1n);

    await eventPlatform.connect(student).buyCreditsWithEth({ value: ethSpent });
    await creditsToken.connect(student).approve(eventPlatform.target, creditsPrice);

    await eventPlatform.connect(student).obtainTicketWithCredits(1n, 1n);

    expect(await treasuryVault.paidCreditsByEvent(1n)).to.equal(creditsPrice);
    expect(await ticketNFT.ownerOf(1n)).to.equal(student.address);
  });
});
