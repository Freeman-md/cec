import { useCallback, useEffect, useMemo, useState } from "react";
import { detectRole, getExpectedChainId, getExpectedChainLabel, readCreditsBalance } from "../lib/contracts";
import { useWallet } from "./useWallet";
import type { AppRole, AppSession, SessionIdentity, TransactionEvidence } from "../types/app";

function formatConnectedIdentity(role: AppRole, account: string): SessionIdentity {
  const roleLabels: Record<AppRole, string> = {
    student: "Student",
    organizer: "Approved Organizer",
    admin: "Admin",
  };

  return {
    account: `${account.slice(0, 6)}...${account.slice(-4)}`,
    label: roleLabels[role],
  };
}

export function useAppSession() {
  const wallet = useWallet();
  const expectedChainId = getExpectedChainId();
  const expectedChainLabel = getExpectedChainLabel();
  const [detectedRole, setDetectedRole] = useState<AppRole>("student");
  const [creditsBalance, setCreditsBalance] = useState("0");
  const [latestTransaction, setLatestTransaction] = useState<TransactionEvidence | null>(null);

  const refreshSession = useCallback(async () => {
    if (!wallet.provider || !wallet.account || wallet.chainId !== expectedChainId) {
      setDetectedRole("student");
      setCreditsBalance("0");
      return;
    }

    const [role, balance] = await Promise.all([
      detectRole(wallet.provider, wallet.account),
      readCreditsBalance(wallet.provider, wallet.account),
    ]);

    setDetectedRole(role);
    setCreditsBalance(balance);
  }, [expectedChainId, wallet.account, wallet.chainId, wallet.provider]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const role = detectedRole;
  const identity = wallet.account
    ? formatConnectedIdentity(role, wallet.account)
    : ({
        account: "Connect wallet",
        label: "Wallet not connected",
      } satisfies SessionIdentity);
  const chainLabel =
    wallet.chainId === expectedChainId
      ? expectedChainLabel
      : wallet.chainId
        ? `Wrong network · ${wallet.chainId}`
        : expectedChainLabel;

  return useMemo<AppSession>(
    () => ({
      role,
      identity,
      chainLabel,
      creditsBalance,
      refreshSession,
      connectWallet: wallet.connectWallet,
      isConnected: wallet.isConnected,
      isConnecting: wallet.isConnecting,
      hasWallet: wallet.hasWallet,
      account: wallet.account,
      chainId: wallet.chainId,
      isCorrectNetwork: wallet.chainId === expectedChainId,
      error: wallet.error,
      provider: wallet.provider,
      latestTransaction,
      setLatestTransaction,
    }),
    [
      role,
      identity,
      chainLabel,
      creditsBalance,
      refreshSession,
      wallet.connectWallet,
      wallet.isConnected,
      wallet.isConnecting,
      wallet.hasWallet,
      wallet.account,
      wallet.chainId,
      expectedChainId,
      wallet.error,
      wallet.provider,
      latestTransaction,
    ],
  );
}
