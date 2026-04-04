import { Link } from "react-router-dom";

type CreditsBannerProps = {
  balanceLabel: string;
};

export function CreditsBanner({ balanceLabel }: CreditsBannerProps) {
  return (
    <section className="discover-credits-banner surface-card">
      <div>
        <p className="eyebrow">Need more credits?</p>
        <h2 className="title is-3">Top up instantly with CEC</h2>
        <p className="subtitle is-6">
          Buy more credits to unlock premium campus experiences, limited-access drops, and curated night sessions.
        </p>
      </div>

      <div className="discover-credits-banner__panel">
        <div className="discover-credits-banner__balance">
          <span className="placeholder-label">Current balance</span>
          <strong>{balanceLabel}</strong>
        </div>
        <Link className="button is-primary discover-credits-banner__button" to="/credits">
          Buy Credits Now
        </Link>
      </div>
    </section>
  );
}
