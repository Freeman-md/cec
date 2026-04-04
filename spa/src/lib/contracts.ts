import { Contract, formatUnits, type BrowserProvider, type ContractRunner, type InterfaceAbi } from "ethers";
import contractInfo from "../config/contract-info.json";
import type { AppRole } from "../types/app";

type ContractConfig = {
  address: string;
  abi: InterfaceAbi;
};

type ContractInfo = typeof contractInfo & {
  creditsToken: ContractConfig;
  eventPlatform: ContractConfig;
};

const appContracts = contractInfo as ContractInfo;

function getContract(config: ContractConfig, runner: ContractRunner) {
  return new Contract(config.address, config.abi, runner);
}

export function getAppContracts(runner: ContractRunner) {
  return {
    creditsToken: getContract(appContracts.creditsToken, runner),
    eventPlatform: getContract(appContracts.eventPlatform, runner),
  };
}

export function getExpectedChainId() {
  return Number(appContracts.chainId);
}

export function getExpectedChainLabel() {
  return `${appContracts.networkName} · ${appContracts.chainId}`;
}

export async function detectRole(provider: BrowserProvider, account: string): Promise<AppRole> {
  const { eventPlatform } = getAppContracts(provider);

  try {
    const admin = String(await eventPlatform.admin()).toLowerCase();
    if (admin === account.toLowerCase()) {
      return "admin";
    }

    const approvedOrganizer = Boolean(await eventPlatform.approvedOrganizers(account));
    return approvedOrganizer ? "organizer" : "student";
  } catch {
    return "student";
  }
}

export async function readCreditsBalance(provider: BrowserProvider, account: string) {
  const { creditsToken } = getAppContracts(provider);

  try {
    const balance = await creditsToken.balanceOf(account);
    return formatUnits(balance, 18);
  } catch {
    return "0";
  }
}

export async function readExchangeRate(provider: BrowserProvider) {
  const { eventPlatform } = getAppContracts(provider);

  try {
    return BigInt(await eventPlatform.ethToCreditsRate());
  } catch {
    return 0n;
  }
}
