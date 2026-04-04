import { promises as fs } from "node:fs";
import path from "node:path";
import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();
  const [admin] = await ethers.getSigners();

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

  await creditsToken.setPlatform(eventPlatform.target);
  await ticketNFT.setPlatform(eventPlatform.target);
  await treasuryVault.setPlatform(eventPlatform.target);

  const contractInfo = {
    networkName: "localhost",
    chainId: 31337,
    creditsToken: {
      address: await creditsToken.getAddress(),
      abi: JSON.parse(creditsToken.interface.formatJson()),
    },
    eventPlatform: {
      address: await eventPlatform.getAddress(),
      abi: JSON.parse(eventPlatform.interface.formatJson()),
    },
  };

  const outputPath = path.resolve(process.cwd(), "spa", "src", "config", "contract-info.json");
  await fs.writeFile(outputPath, JSON.stringify(contractInfo, null, 2));

  console.log(`Wrote SPA contract config to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
