import type { TransactionEvidence } from "../types/app";

type TransactionEvidenceCardProps = {
  evidence: TransactionEvidence | null;
  statusLabel: string;
  title?: string;
};

export function TransactionEvidenceCard({
  evidence,
  statusLabel,
  title = "Latest transaction evidence",
}: TransactionEvidenceCardProps) {
  return (
    <section className="surface-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Transaction evidence</p>
          <h2 className="title is-4">{title}</h2>
        </div>
        <span className="status-pill status-pill--info">{statusLabel}</span>
      </div>

      {!evidence ? (
        <div className="simple-panel">
          <h3 className="title is-5">No transaction recorded yet</h3>
          <p className="meta-line">Complete a credit purchase or ticket purchase to populate this evidence panel.</p>
        </div>
      ) : (
        <div className="info-list">
          <div className="info-block">
            <h3 className="title is-6">Tx hash</h3>
            <p className="meta-line mono-line">{evidence.hash}</p>
          </div>
          <div className="info-block">
            <h3 className="title is-6">Receipt status</h3>
            <p className="meta-line">{evidence.receiptStatus}</p>
          </div>
          <div className="info-block">
            <h3 className="title is-6">Block number</h3>
            <p className="meta-line">{evidence.blockNumber}</p>
          </div>
          <div className="info-block">
            <h3 className="title is-6">Gas used</h3>
            <p className="meta-line">{evidence.gasUsed}</p>
          </div>
          {evidence.beforeCreditsBalance && evidence.afterCreditsBalance ? (
            <div className="info-block">
              <h3 className="title is-6">CEC balance change</h3>
              <p className="meta-line">
                {evidence.beforeCreditsBalance} → {evidence.afterCreditsBalance}
              </p>
            </div>
          ) : null}
          {evidence.beforeEthBalance && evidence.afterEthBalance ? (
            <div className="info-block">
              <h3 className="title is-6">ETH balance change</h3>
              <p className="meta-line">
                {evidence.beforeEthBalance} → {evidence.afterEthBalance}
              </p>
            </div>
          ) : null}
          {evidence.summary ? (
            <div className="info-block">
              <h3 className="title is-6">Summary</h3>
              <p className="meta-line">{evidence.summary}</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
