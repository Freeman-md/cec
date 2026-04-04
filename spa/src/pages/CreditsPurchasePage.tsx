import type { AppRole } from "../types/app";
import { PageIntro } from "../components/PageIntro";

type CreditsPurchasePageProps = {
  session: {
    role: AppRole;
  };
};

export function CreditsPurchasePage({ session }: CreditsPurchasePageProps) {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Credits purchase"
        title="Buy CEC Tokens"
        summary="This page will become the first fully wired transaction flow. For now it locks the final layout zones and evidence surfaces."
      />

      <div className="page-two-column">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Purchase flow</p>
              <h2 className="title is-4">Input and conversion skeleton</h2>
            </div>
            <span className="status-pill status-pill--info">Role: {session.role}</span>
          </div>

          <div className="placeholder-stack">
            <div className="placeholder-card">
              <p className="placeholder-label">You pay</p>
              <p className="placeholder-value">1.25 ETH</p>
            </div>
            <div className="placeholder-card">
              <p className="placeholder-label">You receive</p>
              <p className="placeholder-value">1,250 CEC</p>
            </div>
            <div className="placeholder-inline-grid">
              <div className="placeholder-card">
                <p className="placeholder-label">New ETH balance</p>
                <p className="placeholder-value placeholder-value--small">1.20 ETH</p>
              </div>
              <div className="placeholder-card">
                <p className="placeholder-label">New CEC balance</p>
                <p className="placeholder-value placeholder-value--small">2,500 CEC</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evidence surface</p>
              <h2 className="title is-4">Transaction panel placeholder</h2>
            </div>
            <span className="status-pill status-pill--success">Success state</span>
          </div>
          <div className="info-list">
            <div className="info-block">
              <h3 className="title is-6">Tx hash</h3>
              <p className="meta-line mono-line">0xabc...1234abcd5678</p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Receipt fields</h3>
              <p className="meta-line">Block number · gas used · emitted logs · success / failure</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
