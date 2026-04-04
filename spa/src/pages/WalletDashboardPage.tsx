import { PageIntro } from "../components/PageIntro";
import { TransactionEvidenceCard } from "../components/TransactionEvidenceCard";
import type { AppSession } from "../types/app";

type WalletDashboardPageProps = {
  session: AppSession;
};

export function WalletDashboardPage({ session }: WalletDashboardPageProps) {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Wallet"
        title="Account overview"
        summary="Review the connected account, current network, live CEC balance, and the latest on-chain transaction."
      />

      <div className="card-grid card-grid--two">
        <section className="surface-card">
          <p className="eyebrow">Identity</p>
          <h2 className="title is-4">{session.identity.label}</h2>
          <p className="meta-line mono-line">{session.identity.account}</p>
          <p className="meta-line">{session.chainLabel}</p>
        </section>

        <section className="surface-card">
          <p className="eyebrow">Balance</p>
          <h2 className="title is-4">{session.creditsBalance} CEC</h2>
          <p className="meta-line">
            {session.isConnected
              ? session.isCorrectNetwork
                ? "Live credit balance loaded from the connected wallet."
                : "Switch to the configured localhost network to load the correct balance."
              : "Connect a wallet to load balances and transaction evidence."}
          </p>
        </section>
      </div>

      <TransactionEvidenceCard evidence={session.latestTransaction} statusLabel={session.latestTransaction?.receiptStatus ?? "Idle"} />
    </div>
  );
}
