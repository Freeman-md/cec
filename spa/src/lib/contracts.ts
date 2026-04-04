import { BrowserProvider, Contract } from "ethers";
import contractInfo from "../config/contract-info.json";

export type DeployedContractInfo = typeof contractInfo;

export function hasDeployedContracts() {
  return (
    contractInfo.creditsToken.address !== "0x0000000000000000000000000000000000000000" &&
    contractInfo.eventPlatform.address !== "0x0000000000000000000000000000000000000000" &&
    contractInfo.creditsToken.abi.length > 0 &&
    contractInfo.eventPlatform.abi.length > 0
  );
}

export function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required to use the SPA.");
  }

  return new BrowserProvider(window.ethereum);
}

export async function getSignerAddress(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export async function getCreditsTokenContract(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  return new Contract(contractInfo.creditsToken.address, contractInfo.creditsToken.abi, signer);
}

export async function getEventPlatformContract(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  return new Contract(contractInfo.eventPlatform.address, contractInfo.eventPlatform.abi, signer);
}

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
      on(event: string, handler: (...args: unknown[]) => void): void;
      removeListener(event: string, handler: (...args: unknown[]) => void): void;
    };
  }
}
