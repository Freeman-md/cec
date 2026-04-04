import { Link } from "react-router-dom";
import type { DiscoverEvent } from "./discoverData";

type FeaturedEventCardProps = {
  event: DiscoverEvent;
};

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  return (
    <article className="discover-event-card">
      <div className={`discover-event-card__image ${event.imageClassName}`}>
        <span className="price-pill discover-event-card__price">{event.priceLabel}</span>
      </div>

      <div className="discover-event-card__body">
        <div className="discover-event-card__header">
          <span className="status-pill status-pill--ghost">{event.category}</span>
          <span className={`status-pill ${event.stateLabel === "Low availability" ? "status-pill--error" : "status-pill--info"}`}>
            {event.stateLabel}
          </span>
        </div>

        <div>
          <h3 className="title is-5">{event.title}</h3>
          <p className="meta-line">{event.scheduleLabel}</p>
          <p className="meta-line">{event.venue}</p>
        </div>

        <div className="discover-event-card__footer">
          <span className="meta-line">Verified campus access</span>
          <Link className="discover-event-card__link" to={`/events/${event.slug}`}>
            {event.ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
