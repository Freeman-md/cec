import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserProvider, getInjectedProvider } from "../lib/ethereum";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const provider = useMemo(() => createBrowserProvider(), []);

  const refreshWallet = useCallback(async () => {
    if (!provider) {
      setAccount(null);
      setChainId(null);
      return;
    }

    try {
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      const accounts = await provider.send("eth_accounts", []);
      setAccount(accounts[0] ?? null);
      setError(null);
    } catch {
      setError("Unable to read the connected wallet.");
    }
  }, [provider]);

  const connectWallet = useCallback(async () => {
    if (!provider) {
      setError("No injected wallet was detected.");
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setAccount(accounts[0] ?? null);
      setChainId(Number(network.chainId));
      setError(null);
    } catch {
      setError("Wallet connection was cancelled or failed.");
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const injectedProvider = getInjectedProvider();
    if (!injectedProvider?.on) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts)) {
        setAccount(typeof accounts[0] === "string" ? accounts[0] : null);
      }
    };

    const handleChainChanged = () => {
      void refreshWallet();
    };

    injectedProvider.on("accountsChanged", handleAccountsChanged);
    injectedProvider.on("chainChanged", handleChainChanged);

    return () => {
      injectedProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      injectedProvider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [refreshWallet]);

  return {
    provider,
    account,
    chainId,
    error,
    hasWallet: Boolean(provider),
    isConnected: Boolean(account),
    isConnecting,
    connectWallet,
  };
}
