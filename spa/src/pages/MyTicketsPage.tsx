import { useEffect, useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { getEventContentByEventId } from "../data/demoEvents";
import { readOwnedTickets } from "../lib/contracts";
import type { AppRole } from "../types/app";

type MyTicketsPageProps = {
  session: {
    role: AppRole;
    provider: Awaited<ReturnType<typeof import("../lib/ethereum").createBrowserProvider>>;
    account: string | null;
    isConnected: boolean;
    isCorrectNetwork: boolean;
  };
};

type OwnedTicketView = {
  ticketId: number;
  stateLabel: string;
  stateClassName: string;
  eventTitle: string;
  tierLabel: string;
  dateLabel: string;
  venue: string;
};

function ticketStatePresentation(state: number) {
  switch (state) {
    case 0:
      return { label: "Active", className: "status-pill status-pill--active" };
    case 1:
      return { label: "Invalidated", className: "status-pill status-pill--error" };
    case 2:
      return { label: "Refunded", className: "status-pill status-pill--used" };
    case 3:
      return { label: "Used", className: "status-pill status-pill--used" };
    default:
      return { label: "Unknown", className: "status-pill status-pill--info" };
  }
}

export function MyTicketsPage({ session }: MyTicketsPageProps) {
  const [tickets, setTickets] = useState<OwnedTicketView[]>([]);

  useEffect(() => {
    async function hydrateTickets() {
      if (!session.provider || !session.account || !session.isConnected || !session.isCorrectNetwork) {
        setTickets([]);
        return;
      }

      const ownedTickets = await readOwnedTickets(session.provider, session.account);

      const mappedTickets = ownedTickets.map((ticket) => {
        const eventEntry = getEventContentByEventId(ticket.eventId);
        const state = ticketStatePresentation(ticket.state);

        return {
          ticketId: ticket.ticketId,
          stateLabel: state.label,
          stateClassName: state.className,
          eventTitle: eventEntry.title,
          tierLabel: eventEntry.tierLabels[ticket.tierId as keyof typeof eventEntry.tierLabels] ?? `Tier ${ticket.tierId}`,
          dateLabel: `${eventEntry.dateLabel} · ${eventEntry.timeLabel}`,
          venue: eventEntry.venue,
        };
      });

      setTickets(mappedTickets);
    }

    void hydrateTickets();
  }, [session.account, session.isConnected, session.isCorrectNetwork, session.provider]);

  const hasTickets = useMemo(() => tickets.length > 0, [tickets]);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Digital access"
        title="My Tickets"
        summary="View the NFT tickets currently owned by the connected wallet and inspect their on-chain lifecycle state."
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owned assets</p>
            <h2 className="title is-4">Wallet ticket inventory</h2>
          </div>
          <div className="chip-row">
            <span className="status-pill status-pill--active">Active</span>
            <span className="status-pill status-pill--used">Used / Refunded</span>
            <span className="status-pill status-pill--error">Invalidated</span>
          </div>
        </div>

        {!session.isConnected ? (
          <div className="simple-panel">
            <h3 className="title is-5">Connect a wallet to view tickets</h3>
            <p className="meta-line">The ticket inventory is read from the connected wallet on the configured local chain.</p>
          </div>
        ) : !session.isCorrectNetwork ? (
          <div className="simple-panel">
            <h3 className="title is-5">Switch to the local Hardhat network</h3>
            <p className="meta-line">Ticket ownership is only loaded from the configured localhost deployment.</p>
          </div>
        ) : !hasTickets ? (
          <div className="simple-panel">
            <h3 className="title is-5">No tickets owned yet</h3>
            <p className="meta-line">Buy credits, purchase a tier on the event page, then return here to verify NFT ownership.</p>
          </div>
        ) : (
          <div className="card-grid card-grid--three">
            {tickets.map((ticket) => (
              <article key={ticket.ticketId} className="ticket-card">
                <div className="ticket-card__image" />
                <div className="ticket-card__body">
                  <div className="ticket-card__header">
                    <h3 className="title is-5">{ticket.eventTitle}</h3>
                    <span className={ticket.stateClassName}>{ticket.stateLabel}</span>
                  </div>
                  <p className="meta-line">Ticket #{ticket.ticketId}</p>
                  <p className="meta-line">{ticket.tierLabel}</p>
                  <p className="meta-line">{ticket.dateLabel}</p>
                  <p className="meta-line">{ticket.venue}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
