import type { AppRole } from "../hooks/usePreviewSession";
import { PageIntro } from "../components/PageIntro";

type WalletDashboardPageProps = {
  session: {
    role: AppRole;
    identity: {
      account: string;
      label: string;
    };
    chainLabel: string;
  };
};

export function WalletDashboardPage({ session }: WalletDashboardPageProps) {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Wallet dashboard"
        title="Cryptographic proof surfaces"
        summary="This route locks the final dashboard layout while removing unsupported DeFi-style actions from the rebuild."
      />

      <div className="card-grid card-grid--two">
        <section className="surface-card">
          <p className="eyebrow">Identity</p>
          <h2 className="title is-4">{session.identity.label}</h2>
          <p className="meta-line mono-line">{session.identity.account}</p>
          <p className="meta-line">{session.chainLabel}</p>
        </section>

        <section className="surface-card">
          <p className="eyebrow">Portfolio</p>
          <h2 className="title is-4">CEC and transaction summary</h2>
          <p className="meta-line">This page will keep balance, activity, and latest transaction evidence in one place.</p>
        </section>
      </div>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest evidence</p>
            <h2 className="title is-4">Reserved transaction proof panel</h2>
          </div>
          <span className="status-pill status-pill--success">Visible in demo</span>
        </div>
        <div className="placeholder-inline-grid">
          <div className="placeholder-card">
            <p className="placeholder-label">Transaction hash</p>
            <p className="placeholder-value placeholder-value--small mono-line">0x4f3e...b92a7c41deef2a3b</p>
          </div>
          <div className="placeholder-card">
            <p className="placeholder-label">Block and gas</p>
            <p className="placeholder-value placeholder-value--small">#18,432,012 · 21,000 gas</p>
          </div>
        </div>
      </section>
    </div>
  );
}
