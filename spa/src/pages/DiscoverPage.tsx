import { Link } from "react-router-dom";
import type { AppRole } from "../hooks/usePreviewSession";
import { CreditsBanner } from "../components/discover/CreditsBanner";
import { DiscoverCategoryTabs } from "../components/discover/DiscoverCategoryTabs";
import { DiscoverHero } from "../components/discover/DiscoverHero";
import { FeaturedEventCard } from "../components/discover/FeaturedEventCard";
import { featuredDiscoverEvents } from "../components/discover/discoverData";

type DiscoverPageProps = {
  session: {
    role: AppRole;
    identity: {
      label: string;
    };
  };
};

export function DiscoverPage({ session }: DiscoverPageProps) {
  return (
    <div className="discover-page">
      <DiscoverHero roleLabel={session.identity.label} />

      <section className="discover-section">
        <div className="section-heading discover-section__heading">
          <div>
            <p className="eyebrow">Featured experiences</p>
            <h2 className="title is-3">Hand-picked events verified by the Neon DAO.</h2>
          </div>
          <Link className="discover-section__link" to="/wallet">
            View Wallet
          </Link>
        </div>

        <DiscoverCategoryTabs />

        <div className="card-grid card-grid--three discover-page__grid">
          {featuredDiscoverEvents.map((event) => (
            <FeaturedEventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <CreditsBanner balanceLabel="1,250 CEC" />
    </div>
  );
}
