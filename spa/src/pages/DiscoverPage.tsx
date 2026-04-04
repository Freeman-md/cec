import { Link } from "react-router-dom";
import type { AppRole } from "../hooks/usePreviewSession";
import { PageIntro } from "../components/PageIntro";

type DiscoverPageProps = {
  session: {
    role: AppRole;
  };
};

const featuredEvents = [
  {
    slug: "campus-beats-2024",
    title: "Campus Beats 2024",
    category: "Music",
    venue: "Neo-Tokyo Arena",
    price: "150 CEC",
  },
  {
    slug: "neural-network-architecture",
    title: "Neural Network Architecture",
    category: "Workshops",
    venue: "Research Block B",
    price: "Free",
  },
  {
    slug: "midnight-streetball-finals",
    title: "Midnight Streetball Finals",
    category: "Sports",
    venue: "Central Court",
    price: "120 CEC",
  },
];

export function DiscoverPage({ session }: DiscoverPageProps) {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Live on campus"
        title="Curate Your Digital Reality."
        summary="Shared shell locked. This page now anchors the final premium event-discovery direction for the role-aware rebuild."
        actions={
          <div className="button-row">
            <Link className="button is-primary" to="/credits">
              Buy CEC Credits
            </Link>
            <Link className="button is-dark is-outlined" to="/events/campus-beats-2024">
              Explore Event
            </Link>
          </div>
        }
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Header state</p>
            <h2 className="title is-4">Dynamic role-aware navigation</h2>
          </div>
          <span className="status-pill status-pill--info">{session.role}</span>
        </div>
        <p className="subtitle is-6">
          The header now switches visible destinations based on the current preview role. Wallet-driven role detection will replace the preview selector in the next slice.
        </p>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured experiences</p>
            <h2 className="title is-4">Discover page skeleton</h2>
          </div>
          <div className="chip-row">
            <span className="status-pill status-pill--active">All Events</span>
            <span className="status-pill">Music</span>
            <span className="status-pill">Sports</span>
            <span className="status-pill">Workshops</span>
            <span className="status-pill">Arts</span>
          </div>
        </div>

        <div className="card-grid card-grid--three">
          {featuredEvents.map((event) => (
            <article key={event.slug} className="feature-card">
              <div className="feature-card__image" />
              <div className="feature-card__body">
                <span className="status-pill status-pill--ghost">{event.category}</span>
                <h3 className="title is-5 mt-3">{event.title}</h3>
                <p className="meta-line">{event.venue}</p>
                <div className="feature-card__footer">
                  <span className="price-pill">{event.price}</span>
                  <Link to={`/events/${event.slug}`}>View details</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
