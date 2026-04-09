import { formatEther, formatUnits } from "ethers";

export function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCredits(amount: bigint | null) {
  if (amount === null) return "0";
  return formatUnits(amount, 18);
}

export function formatEth(amount: bigint | null) {
  if (amount === null) return "0";
  return formatEther(amount);
}
