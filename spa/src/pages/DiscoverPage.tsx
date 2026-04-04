import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEventContentByEventId, getEventRouteKey } from "../data/demoEvents";
import { readAllEvents } from "../lib/contracts";
import type { AppSession } from "../types/app";

type DiscoverPageProps = {
  session: AppSession;
};

function formatCec(value: string) {
  const asNumber = Number(value);

  if (Number.isNaN(asNumber)) {
    return "0";
  }

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(asNumber);
}

function stateLabel(eventState: number) {
  switch (eventState) {
    case 1:
      return "On Sale";
    case 2:
      return "Sold Out";
    case 3:
      return "Cancelled";
    case 4:
      return "Completed";
    default:
      return "Draft";
  }
}

export function DiscoverPage({ session }: DiscoverPageProps) {
  const [events, setEvents] = useState<
    Array<{
      eventId: number;
      eventState: number;
      startingPrice: string;
      routeKey: string;
    }>
  >([]);

  useEffect(() => {
    async function hydrateEvents() {
      if (!session.provider || !session.isCorrectNetwork) {
        setEvents([]);
        return;
      }

      const eventRows = await readAllEvents(session.provider);
      setEvents(
        eventRows.map((eventItem) => ({
          eventId: eventItem.eventId,
          eventState: eventItem.eventState,
          startingPrice: formatUnits(eventItem.startingPriceInCredits, 18),
          routeKey: getEventRouteKey(eventItem.eventId),
        })),
      );
    }

    void hydrateEvents();
  }, [session.isCorrectNetwork, session.provider]);

  const featuredEvent = events[0] ?? null;
  const featuredEventContent = featuredEvent ? getEventContentByEventId(featuredEvent.eventId) : null;

  return (
    <div className="page-stack">
      <section className="surface-card">
        <div className="columns is-variable is-6 is-vcentered">
          <div className="column is-8">
            <p className="eyebrow">Discover events</p>
            <h1 className="title is-2">Curate your campus event journey.</h1>
            <p className="subtitle is-5">
              Browse verified events, buy CEC with ETH, and access tickets through one connected wallet.
            </p>
            <div className="buttons mt-4">
              {featuredEvent ? (
                <Link className="button is-primary" to={`/events/${featuredEvent.routeKey}`}>
                  View Featured Event
                </Link>
              ) : null}
              <Link className="button is-light" to="/credits">
                Buy CEC Credits
              </Link>
            </div>
          </div>
          <div className="column is-4">
            <div className="simple-balance-card">
              <p className="meta-line">Connected balance</p>
              <p className="title is-4">{formatCec(session.creditsBalance)} CEC</p>
              <p className="meta-line">{session.isConnected ? "Live wallet balance" : "Connect a wallet to load balance"}</p>
            </div>
          </div>
        </div>
      </section>

      {featuredEvent && featuredEventContent ? (
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured event</p>
              <h2 className="title is-4">{featuredEventContent.title}</h2>
            </div>
            <span className="status-pill status-pill--info">{stateLabel(featuredEvent.eventState)}</span>
          </div>

          <div className="columns is-variable is-5">
            <div className="column is-8">
              <p className="meta-line">
                {featuredEventContent.dateLabel} · {featuredEventContent.timeLabel}
              </p>
              <p className="meta-line">{featuredEventContent.venue}</p>
              <p className="subtitle is-6 mt-3">{featuredEventContent.summary}</p>
            </div>
            <div className="column is-4">
              <div className="simple-panel">
                <p className="meta-line">Starting from</p>
                <p className="title is-4">{formatCec(featuredEvent.startingPrice)} CEC</p>
                <Link className="button is-link is-light is-fullwidth" to={`/events/${featuredEvent.routeKey}`}>
                  Open Event
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">All events</p>
            <h2 className="title is-4">Live event directory</h2>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="simple-panel">
            <h3 className="title is-5">No events available yet</h3>
            <p className="meta-line">Approved organizers can create events in the Organizer Studio and they will appear here automatically.</p>
          </div>
        ) : (
          <div className="card-grid card-grid--three">
            {events.map((eventItem) => {
              const content = getEventContentByEventId(eventItem.eventId);
              return (
                <article key={eventItem.eventId} className="simple-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Event #{eventItem.eventId}</p>
                    <span className="status-pill status-pill--info">{stateLabel(eventItem.eventState)}</span>
                  </div>
                  <h3 className="title is-5">{content.title}</h3>
                  <p className="meta-line">{content.venue}</p>
                  <p className="meta-line">
                    {content.dateLabel} · {content.timeLabel}
                  </p>
                  <p className="meta-line">Starting from {formatCec(eventItem.startingPrice)} CEC</p>
                  <Link className="button is-link is-light is-fullwidth mt-4" to={`/events/${eventItem.routeKey}`}>
                    Open Event
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
