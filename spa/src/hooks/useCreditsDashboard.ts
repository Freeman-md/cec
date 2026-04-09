import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getCreditsTokenContract, hasDeployedContracts } from "../lib/contracts";

type DashboardState = {
  tokenName: string;
  tokenSymbol: string;
  creditsBalance: bigint | null;
  refresh: () => Promise<void>;
};

export function useCreditsDashboard(provider: BrowserProvider | null, account: string): DashboardState {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [creditsBalance, setCreditsBalance] = useState<bigint | null>(null);

  const refresh = async () => {
    if (!provider || !account || !hasDeployedContracts()) return;

    const creditsToken = await getCreditsTokenContract(provider);

    const [name, symbol, balance] = await Promise.all([
      creditsToken.name(),
      creditsToken.symbol(),
      creditsToken.balanceOf(account),
    ]);

    setTokenName(name);
    setTokenSymbol(symbol);
    setCreditsBalance(balance as bigint);
  };

  useEffect(() => {
    void refresh();
  }, [provider, account]);

  return {
    tokenName,
    tokenSymbol,
    creditsBalance,
    refresh,
  };
}
