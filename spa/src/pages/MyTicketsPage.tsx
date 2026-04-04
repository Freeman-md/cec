import type { AppRole } from "../hooks/usePreviewSession";
import { PageIntro } from "../components/PageIntro";

type MyTicketsPageProps = {
  session: {
    role: AppRole;
  };
};

const ticketStates = ["Active", "Used", "Invalidated"] as const;

export function MyTicketsPage({ session }: MyTicketsPageProps) {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Digital access"
        title="My Tickets"
        summary={`Ticket ownership skeleton for the ${session.role} preview. On-chain ownership and lifecycle state reads will be wired in a later slice.`}
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owned assets</p>
            <h2 className="title is-4">Ticket state layout</h2>
          </div>
          <div className="chip-row">
            <span className="status-pill status-pill--active">Active</span>
            <span className="status-pill status-pill--used">Used</span>
            <span className="status-pill status-pill--error">Invalidated</span>
          </div>
        </div>

        <div className="card-grid card-grid--three">
          {ticketStates.map((state) => (
            <article key={state} className="ticket-card">
              <div className="ticket-card__image" />
              <div className="ticket-card__body">
                <div className="ticket-card__header">
                  <h3 className="title is-5">Neon Access Pass</h3>
                  <span
                    className={`status-pill ${
                      state === "Active"
                        ? "status-pill--active"
                        : state === "Used"
                          ? "status-pill--used"
                          : "status-pill--error"
                    }`}
                  >
                    {state}
                  </span>
                </div>
                <p className="meta-line">Ticket ID · Event name · Tier · Venue</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
