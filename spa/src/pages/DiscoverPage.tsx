import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoEvents, type DemoEventSlug } from "../data/demoEvents";
import { getDemoData, readEventSnapshot } from "../lib/contracts";
import type { AppRole } from "../types/app";

type DiscoverPageProps = {
  session: {
    role: AppRole;
    provider: Awaited<ReturnType<typeof import("../lib/ethereum").createBrowserProvider>>;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    creditsBalance: string;
  };
};

const demoData = getDemoData();

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
  const featuredEventSlug = demoData.featuredEventSlug as DemoEventSlug;
  const eventContent = demoEvents[featuredEventSlug];
  const [eventPrice, setEventPrice] = useState("0");
  const [eventSaleState, setEventSaleState] = useState("Draft");

  useEffect(() => {
    async function hydrateFeaturedEvent() {
      if (!session.provider || !session.isCorrectNetwork) {
        setEventPrice("0");
        setEventSaleState("Offline");
        return;
      }

      const snapshot = await readEventSnapshot(session.provider, demoData.featuredEventId, demoData.tierIds);
      const lowestTier = snapshot.tiers.find((tier) => tier.priceInCredits > 0n);

      setEventPrice(lowestTier ? formatUnits(lowestTier.priceInCredits, 18) : "0");
      setEventSaleState(stateLabel(snapshot.eventState));
    }

    void hydrateFeaturedEvent();
  }, [session.isCorrectNetwork, session.provider]);

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
              <Link className="button is-primary" to={`/events/${demoData.featuredEventSlug}`}>
                View Featured Event
              </Link>
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

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured event</p>
            <h2 className="title is-4">{eventContent.title}</h2>
          </div>
          <span className="status-pill status-pill--info">{eventSaleState}</span>
        </div>

        <div className="columns is-variable is-5">
          <div className="column is-8">
            <p className="meta-line">
              {eventContent.dateLabel} · {eventContent.timeLabel}
            </p>
            <p className="meta-line">{eventContent.venue}</p>
            <p className="subtitle is-6 mt-3">{eventContent.summary}</p>
          </div>
          <div className="column is-4">
            <div className="simple-panel">
              <p className="meta-line">Starting from</p>
              <p className="title is-4">{formatCec(eventPrice)} CEC</p>
              <Link className="button is-link is-light is-fullwidth" to={`/events/${demoData.featuredEventSlug}`}>
                Open Event
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
