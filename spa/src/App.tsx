import { HeroSection } from "./components/HeroSection";
import { WalletPanel } from "./components/WalletPanel";
import { BalancePanel } from "./components/BalancePanel";
import { BuyCreditsCard } from "./components/BuyCreditsCard";
import { TransactionReceiptCard } from "./components/TransactionReceiptCard";
import { DeploymentStatusCard } from "./components/DeploymentStatusCard";
import { useWallet } from "./hooks/useWallet";
import { useCreditsDashboard } from "./hooks/useCreditsDashboard";
import { useBuyCredits } from "./hooks/useBuyCredits";

export function App() {
  const { account, provider, chainId, error: walletError, connectWallet } = useWallet();
  const { tokenName, tokenSymbol, creditsBalance, refresh } = useCreditsDashboard(provider, account);
  const {
    isSubmitting,
    error: buyError,
    receipt,
    beforeBalance,
    afterBalance,
    buyCredits,
  } = useBuyCredits(provider, account);

  const handleBuyCredits = async (ethAmount: string) => {
    await buyCredits(ethAmount);
    await refresh();
  };

  return (
    <main className="app-shell section">
      <div className="container is-max-desktop">
        <HeroSection />

        <div className="columns is-variable is-5 mt-1">
          <div className="column is-5">
            <WalletPanel account={account} chainId={chainId} error={walletError} onConnect={connectWallet} />
            <BalancePanel tokenName={tokenName} tokenSymbol={tokenSymbol} creditsBalance={creditsBalance} />
          </div>

          <div className="column is-7">
            <DeploymentStatusCard />
            <BuyCreditsCard isSubmitting={isSubmitting} onBuyCredits={handleBuyCredits} />
            <TransactionReceiptCard
              receipt={receipt}
              beforeBalance={beforeBalance}
              afterBalance={afterBalance}
              error={buyError}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
