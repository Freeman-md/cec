import { Link, useParams } from "react-router-dom";
import type { AppRole } from "../types/app";
import { PageIntro } from "../components/PageIntro";

type EventDetailPageProps = {
  session: {
    role: AppRole;
  };
};

export function EventDetailPage({ session }: EventDetailPageProps) {
  const { eventSlug = "campus-beats-2024" } = useParams();

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="On sale"
        title="Campus Beats 2024"
        summary={`Event detail skeleton for ${eventSlug}. On-chain tier reads and purchase-state handling land in the next feature slices.`}
        actions={
          <div className="button-row">
            <Link className="button is-primary" to="/credits">
              Buy More Credits
            </Link>
            <button className="button is-link is-light" type="button">
              Purchase Ticket
            </button>
          </div>
        }
      />

      <div className="page-two-column">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Event overview</p>
              <h2 className="title is-4">Narrative + organizer + venue</h2>
            </div>
          </div>
          <div className="info-list">
            <div className="info-block">
              <h3 className="title is-6">About the event</h3>
              <p className="subtitle is-6">
                Off-chain event content will live in JSON while ticket tiers, sale state, and current balances remain on-chain truth.
              </p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Organizer profile</h3>
              <p className="subtitle is-6">Organizer profile module reserved for the stitched design direction.</p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Venue and location</h3>
              <p className="subtitle is-6">Location cards and hero media will be driven by local JSON assets.</p>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Ticket tiers</p>
              <h2 className="title is-4">Purchase area</h2>
            </div>
            <span className="status-pill status-pill--active">Role: {session.role}</span>
          </div>
          <div className="tier-stack">
            <div className="tier-card tier-card--selected">
              <h3 className="title is-5">General Admission</h3>
              <p className="meta-line">150 CEC · In stock</p>
            </div>
            <div className="tier-card">
              <h3 className="title is-5">VIP Obsidian Pass</h3>
              <p className="meta-line">450 CEC · Limited supply</p>
            </div>
            <div className="tier-card tier-card--disabled">
              <h3 className="title is-5">Backstage Experience</h3>
              <p className="meta-line">Sold out</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
