import { useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { getBrowserProvider, getSignerAddress } from "../lib/contracts";

type WalletState = {
  account: string;
  provider: BrowserProvider | null;
  chainId: bigint | null;
  error: string;
  connectWallet: () => Promise<void>;
};

export function useWallet(): WalletState {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const browserProvider = getBrowserProvider();
    setProvider(browserProvider);

    const loadWallet = async () => {
      try {
        const accounts = (await window.ethereum?.request({ method: "eth_accounts" })) as string[];
        const network = await browserProvider.getNetwork();
        setChainId(network.chainId);

        if (accounts.length > 0) {
          setAccount(await getSignerAddress(browserProvider));
        }
      } catch (walletError) {
        setError(walletError instanceof Error ? walletError.message : "Failed to load wallet.");
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccounts = Array.isArray(accounts) ? (accounts as string[]) : [];
      setAccount(nextAccounts[0] ?? "");
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    void loadWallet();
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    try {
      const browserProvider = provider ?? getBrowserProvider();
      setProvider(browserProvider);

      await window.ethereum?.request({ method: "eth_requestAccounts" });
      setAccount(await getSignerAddress(browserProvider));

      const network = await browserProvider.getNetwork();
      setChainId(network.chainId);
      setError("");
    } catch (walletError) {
      setError(walletError instanceof Error ? walletError.message : "Failed to connect wallet.");
    }
  };

  return useMemo(
    () => ({
      account,
      provider,
      chainId,
      error,
      connectWallet,
    }),
    [account, provider, chainId, error],
  );
}
