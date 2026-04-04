import { useState } from "react";
import { BrowserProvider, TransactionReceipt, parseEther } from "ethers";
import { getCreditsTokenContract, getEventPlatformContract, hasDeployedContracts } from "../lib/contracts";

export type ReceiptSummary = {
  hash: string;
  status: string;
  blockNumber: number;
  gasUsed: string;
  emittedLogCount: number;
};

type BuyCreditsState = {
  isSubmitting: boolean;
  error: string;
  receipt: ReceiptSummary | null;
  beforeBalance: bigint | null;
  afterBalance: bigint | null;
  buyCredits: (ethAmount: string) => Promise<void>;
};

function toReceiptSummary(receipt: TransactionReceipt): ReceiptSummary {
  return {
    hash: receipt.hash,
    status: receipt.status === 1 ? "success" : "failed",
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    emittedLogCount: receipt.logs.length,
  };
}

export function useBuyCredits(provider: BrowserProvider | null, account: string): BuyCreditsState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<ReceiptSummary | null>(null);
  const [beforeBalance, setBeforeBalance] = useState<bigint | null>(null);
  const [afterBalance, setAfterBalance] = useState<bigint | null>(null);

  const buyCredits = async (ethAmount: string) => {
    if (!provider || !account || !hasDeployedContracts()) {
      setError("Local contract deployment info is missing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setReceipt(null);

      const [creditsToken, eventPlatform] = await Promise.all([
        getCreditsTokenContract(provider),
        getEventPlatformContract(provider),
      ]);

      const before = (await creditsToken.balanceOf(account)) as bigint;
      setBeforeBalance(before);

      const tx = await eventPlatform.buyCreditsWithEth({
        value: parseEther(ethAmount),
      });

      const mined = await tx.wait();
      const after = (await creditsToken.balanceOf(account)) as bigint;

      setAfterBalance(after);
      setReceipt(toReceiptSummary(mined));
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : "Failed to buy credits.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    receipt,
    beforeBalance,
    afterBalance,
    buyCredits,
  };
}
