import { Link } from "react-router-dom";

type DiscoverHeroProps = {
  roleLabel: string;
};

export function DiscoverHero({ roleLabel }: DiscoverHeroProps) {
  return (
    <section className="discover-hero surface-card">
      <div className="discover-hero__content">
        <span className="status-pill status-pill--active">Live on campus</span>
        <h1 className="discover-hero__title">
          Curate Your
          <span className="discover-hero__title-emphasis"> Digital Reality.</span>
        </h1>
        <p className="discover-hero__summary">
          Access exclusive campus experiences powered by the Neon network. From underground sets to academic intensives, the ticket is the work.
        </p>
        <div className="button-row">
          <Link className="button is-primary discover-hero__button" to="/events/campus-beats-2024">
            Explore Events
          </Link>
          <Link className="button discover-hero__button discover-hero__button--secondary" to="/credits">
            Buy CEC Credits
          </Link>
        </div>
        <p className="discover-hero__caption">Previewing the discover experience for the {roleLabel.toLowerCase()} role.</p>
      </div>

      <div className="discover-hero__visual">
        <div className="discover-hero__orb discover-hero__orb--primary" />
        <div className="discover-hero__orb discover-hero__orb--secondary" />
        <div className="discover-hero__beam discover-hero__beam--one" />
        <div className="discover-hero__beam discover-hero__beam--two" />
        <div className="discover-hero__beam discover-hero__beam--three" />
      </div>
    </section>
  );
}
