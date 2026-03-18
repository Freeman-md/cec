import { network } from "hardhat";

const { ethers } = await network.connect();

export async function deployScaffold() {
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

  return { admin, organizer, student, creditsToken, ticketNFT, treasuryVault, eventPlatform, ethers };
}

export async function runCreditPurchase() {
  const fixture = await deployScaffold();
  const ethSpent = fixture.ethers.parseEther("1");
  const tx = await fixture.eventPlatform.connect(fixture.student).buyCreditsWithEth({ value: ethSpent });
  const receipt = await tx.wait();

  return {
    ...fixture,
    ethSpent,
    tx,
    receipt,
  };
}
