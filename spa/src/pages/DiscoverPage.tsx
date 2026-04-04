import { Link } from "react-router-dom";
import type { AppRole } from "../types/app";

type DiscoverPageProps = {
  session: {
    role: AppRole;
    identity: {
      label: string;
    };
  };
};

const featuredEvents = [
  {
    slug: "campus-beats-2024",
    title: "Campus Beats 2024",
    category: "Music",
    venue: "Neo-Tokyo Arena",
    date: "Oct 24, 2024 · 20:00",
    priceLabel: "150 CEC",
    actionLabel: "View Event",
  },
  {
    slug: "neural-network-architecture",
    title: "Neural Network Architecture",
    category: "Workshops",
    venue: "Research Block B",
    date: "Oct 29, 2024 · 14:30",
    priceLabel: "Free",
    actionLabel: "Reserve Spot",
  },
  {
    slug: "midnight-streetball-finals",
    title: "Midnight Streetball Finals",
    category: "Sports",
    venue: "Central Quad Courts",
    date: "Oct 31, 2024 · 18:30",
    priceLabel: "120 CEC",
    actionLabel: "View Event",
  },
] as const;

export function DiscoverPage({ session }: DiscoverPageProps) {
  return (
    <div className="page-stack">
      <section className="surface-card">
        <div className="columns is-variable is-6 is-vcentered">
          <div className="column is-7">
            <p className="eyebrow">Discover events</p>
            <h1 className="title is-2">Curate your campus event journey.</h1>
            <p className="subtitle is-5">
              Browse verified campus events, buy CEC with ETH, and manage NFT tickets from one simple
              role-aware interface.
            </p>
            <p className="meta-line">Current preview role: {session.identity.label}</p>
            <div className="buttons mt-4">
              <Link className="button is-primary" to="/credits">
                Buy CEC Credits
              </Link>
              <Link className="button is-light" to="/wallet">
                View Wallet
              </Link>
            </div>
          </div>
          <div className="column is-5">
            <div className="simple-panel">
              <p className="eyebrow">What this SPA must prove</p>
              <ul className="simple-list">
                <li>Wallet connection and role-aware pages</li>
                <li>ETH to CEC purchase flow</li>
                <li>CEC-based ticket purchase</li>
                <li>Ticket ownership and transaction evidence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured events</p>
            <h2 className="title is-4">Simple event discovery for CW2</h2>
          </div>
          <div className="tags">
            <span className="tag app-tag">All Events</span>
            <span className="tag app-tag">Music</span>
            <span className="tag app-tag">Sports</span>
            <span className="tag app-tag">Workshops</span>
            <span className="tag app-tag">Arts</span>
          </div>
        </div>

        <div className="columns is-multiline">
          {featuredEvents.map((event) => (
            <div key={event.slug} className="column is-4-desktop is-6-tablet">
              <article className="card simple-event-card">
                <div className="card-content">
                  <div className="content">
                    <p className="eyebrow">{event.category}</p>
                    <h3 className="title is-5">{event.title}</h3>
                    <p className="meta-line">{event.date}</p>
                    <p className="meta-line">{event.venue}</p>
                    <p className="simple-event-card__price">{event.priceLabel}</p>
                  </div>
                  <Link className="button is-link is-light is-fullwidth" to={`/events/${event.slug}`}>
                    {event.actionLabel}
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="columns is-variable is-5">
          <div className="column is-8">
            <p className="eyebrow">Need more credits?</p>
            <h2 className="title is-4">Top up quickly, then return to the ticket flow.</h2>
            <p className="subtitle is-6">
              The coursework build stays simple: buy CEC, purchase a ticket, and inspect the transaction proof.
            </p>
          </div>
          <div className="column is-4">
            <div className="simple-balance-card">
              <p className="meta-line">Current balance</p>
              <p className="title is-4">1,250 CEC</p>
              <Link className="button is-primary is-fullwidth" to="/credits">
                Buy Credits
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
