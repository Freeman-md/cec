import { parseUnits } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { TransactionEvidenceCard } from "../components/TransactionEvidenceCard";
import { RoleGuard } from "../components/RoleGuard";
import { getAppContracts, readOrganizerEvents } from "../lib/contracts";
import type { AppSession } from "../types/app";

type OrganizerStudioPageProps = {
  session: AppSession;
};

type OrganizerEvent = {
  eventId: number;
  state: number;
  walletCap: number;
  nextTierId: number;
};

type ActionStatus = "idle" | "pending" | "success" | "failed";

function eventStateLabel(value: number) {
  switch (value) {
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

function OrganizerEventsView({ events }: { events: OrganizerEvent[] }) {
  return (
    <section className="surface-card">
      <p className="eyebrow">Organizer studio</p>
      <h2 className="title is-3">My Events</h2>
      <p className="subtitle is-6">Review events owned by the connected organizer and the current on-chain state for each one.</p>

      {events.length === 0 ? (
        <div className="simple-panel">
          <h3 className="title is-5">No events created yet</h3>
          <p className="meta-line">Use the Create Event route to create your first organizer-managed event.</p>
        </div>
      ) : (
        <div className="card-grid card-grid--two">
          {events.map((eventItem) => (
            <section key={eventItem.eventId} className="simple-panel">
              <p className="eyebrow">Event #{eventItem.eventId}</p>
              <h3 className="title is-5">{eventStateLabel(eventItem.state)}</h3>
              <p className="meta-line">Wallet cap: {eventItem.walletCap}</p>
              <p className="meta-line">Ticket tiers configured: {eventItem.nextTierId}</p>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

type OrganizerCreateViewProps = {
  session: OrganizerStudioPageProps["session"];
  events: OrganizerEvent[];
  refreshEvents: () => Promise<OrganizerEvent[]>;
};

function OrganizerCreateView({ session, events, refreshEvents }: OrganizerCreateViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(events[0]?.eventId ?? null);
  const [eventStatus, setEventStatus] = useState<ActionStatus>("idle");
  const [eventMessage, setEventMessage] = useState("");

  const [tierLabel, setTierLabel] = useState("");
  const [tierPrice, setTierPrice] = useState("");
  const [tierSupply, setTierSupply] = useState("");
  const [tierStatus, setTierStatus] = useState<ActionStatus>("idle");
  const [tierMessage, setTierMessage] = useState("");

  const [walletCap, setWalletCap] = useState("");
  const [walletCapStatus, setWalletCapStatus] = useState<ActionStatus>("idle");
  const [walletCapMessage, setWalletCapMessage] = useState("");

  const [salesStatus, setSalesStatus] = useState<ActionStatus>("idle");
  const [salesMessage, setSalesMessage] = useState("");

  useEffect(() => {
    if (!events.length) {
      setSelectedEventId(null);
      return;
    }

    setSelectedEventId((current) => (current && events.some((eventItem) => eventItem.eventId === current) ? current : events[0].eventId));
  }, [events]);

  const selectedEvent = useMemo(
    () => events.find((eventItem) => eventItem.eventId === selectedEventId) ?? null,
    [events, selectedEventId],
  );
  const selectedEventIsDraft = selectedEvent?.state === 0;

  async function withOrganizerSigner(
    action: (signer: Awaited<ReturnType<NonNullable<OrganizerStudioPageProps["session"]["provider"]>["getSigner"]>>) => Promise<void>,
  ) {
    if (!session.provider || !session.account || !session.isConnected) {
      session.connectWallet();
      return;
    }

    if (!session.isCorrectNetwork) {
      throw new Error("Switch to the configured localhost network to manage events.");
    }

    const signer = await session.provider.getSigner();
    await action(signer);
  }

  async function handleCreateEvent() {
    try {
      setEventStatus("pending");
      setEventMessage("");

      await withOrganizerSigner(async (signer) => {
        const { eventPlatform } = getAppContracts(signer);
        const tx = await eventPlatform.createEvent();
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: "Pending",
          blockNumber: "-",
          gasUsed: "-",
          summary: "Creating organizer event.",
        });

        const receipt = await tx.wait();
        const refreshedEvents = await refreshEvents();
        await session.refreshSession();

        setEventStatus(receipt?.status === 1 ? "success" : "failed");
        setEventMessage(receipt?.status === 1 ? "Event created successfully." : "Event creation returned a failed receipt.");
        if (receipt?.status === 1) {
          const newestEvent = [...refreshedEvents].sort((left, right) => right.eventId - left.eventId)[0];
          setSelectedEventId(newestEvent?.eventId ?? null);
        }
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
          blockNumber: receipt ? String(receipt.blockNumber) : "-",
          gasUsed: receipt ? receipt.gasUsed.toString() : "-",
          summary: receipt?.status === 1 ? "Organizer event created." : "Organizer event creation failed.",
        });
      });
    } catch (error) {
      setEventStatus("failed");
      setEventMessage(error instanceof Error ? error.message : "Event creation failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Organizer event creation failed.",
      });
    }
  }

  async function handleCreateTier() {
    if (!selectedEventId) {
      setTierStatus("failed");
      setTierMessage("Create or select an event before adding a tier.");
      return;
    }

    if (!selectedEventIsDraft) {
      setTierStatus("failed");
      setTierMessage("Only draft events can be configured. Select a draft event or create a new one first.");
      return;
    }

    const parsedSupply = Number(tierSupply);
    if (!tierLabel.trim()) {
      setTierStatus("failed");
      setTierMessage("Enter a tier label.");
      return;
    }

    if (!Number.isFinite(parsedSupply) || parsedSupply <= 0 || !Number.isInteger(parsedSupply)) {
      setTierStatus("failed");
      setTierMessage("Enter a whole-number supply greater than zero.");
      return;
    }

    let parsedPrice: bigint;
    try {
      parsedPrice = parseUnits(tierPrice || "0", 18);
      if (parsedPrice <= 0n) {
        throw new Error();
      }
    } catch {
      setTierStatus("failed");
      setTierMessage("Enter a valid CEC price greater than zero.");
      return;
    }

    try {
      setTierStatus("pending");
      setTierMessage("");

      await withOrganizerSigner(async (signer) => {
        const { eventPlatform } = getAppContracts(signer);
        const tx = await eventPlatform.createTicketTier(selectedEventId, tierLabel.trim(), parsedPrice, BigInt(parsedSupply));
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: "Pending",
          blockNumber: "-",
          gasUsed: "-",
          summary: `Creating ${tierLabel.trim()} tier for event #${selectedEventId}.`,
        });

        const receipt = await tx.wait();
        await refreshEvents();

        setTierStatus(receipt?.status === 1 ? "success" : "failed");
        setTierMessage(receipt?.status === 1 ? "Ticket tier created successfully." : "Ticket-tier creation returned a failed receipt.");
        if (receipt?.status === 1) {
          setTierLabel("");
          setTierPrice("");
          setTierSupply("");
        }
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
          blockNumber: receipt ? String(receipt.blockNumber) : "-",
          gasUsed: receipt ? receipt.gasUsed.toString() : "-",
          summary: receipt?.status === 1 ? "Ticket tier created." : "Ticket-tier creation failed.",
        });
      });
    } catch (error) {
      setTierStatus("failed");
      setTierMessage(error instanceof Error ? error.message : "Ticket-tier creation failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Ticket-tier creation failed.",
      });
    }
  }

  async function handleWalletCapUpdate() {
    if (!selectedEventId) {
      setWalletCapStatus("failed");
      setWalletCapMessage("Create or select an event before updating the wallet cap.");
      return;
    }

    if (!selectedEventIsDraft) {
      setWalletCapStatus("failed");
      setWalletCapMessage("Wallet cap can only be updated while the selected event is still in Draft.");
      return;
    }

    const parsedCap = Number(walletCap);
    if (!Number.isFinite(parsedCap) || parsedCap <= 0 || !Number.isInteger(parsedCap)) {
      setWalletCapStatus("failed");
      setWalletCapMessage("Enter a whole-number wallet cap greater than zero.");
      return;
    }

    try {
      setWalletCapStatus("pending");
      setWalletCapMessage("");

      await withOrganizerSigner(async (signer) => {
        const { eventPlatform } = getAppContracts(signer);
        const tx = await eventPlatform.setPerEventWalletCap(selectedEventId, BigInt(parsedCap));
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: "Pending",
          blockNumber: "-",
          gasUsed: "-",
          summary: `Updating wallet cap for event #${selectedEventId}.`,
        });

        const receipt = await tx.wait();
        await refreshEvents();

        setWalletCapStatus(receipt?.status === 1 ? "success" : "failed");
        setWalletCapMessage(receipt?.status === 1 ? "Wallet cap updated successfully." : "Wallet-cap update returned a failed receipt.");
        if (receipt?.status === 1) {
          setWalletCap("");
        }
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
          blockNumber: receipt ? String(receipt.blockNumber) : "-",
          gasUsed: receipt ? receipt.gasUsed.toString() : "-",
          summary: receipt?.status === 1 ? "Wallet cap updated." : "Wallet-cap update failed.",
        });
      });
    } catch (error) {
      setWalletCapStatus("failed");
      setWalletCapMessage(error instanceof Error ? error.message : "Wallet-cap update failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Wallet-cap update failed.",
      });
    }
  }

  async function handleStartSales() {
    if (!selectedEventId) {
      setSalesStatus("failed");
      setSalesMessage("Create or select an event before starting ticket sales.");
      return;
    }

    if (!selectedEventIsDraft) {
      setSalesStatus("failed");
      setSalesMessage("Ticket sales can only be started from the Draft state.");
      return;
    }

    try {
      setSalesStatus("pending");
      setSalesMessage("");

      await withOrganizerSigner(async (signer) => {
        const { eventPlatform } = getAppContracts(signer);
        const tx = await eventPlatform.startTicketSales(selectedEventId);
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: "Pending",
          blockNumber: "-",
          gasUsed: "-",
          summary: `Starting ticket sales for event #${selectedEventId}.`,
        });

        const receipt = await tx.wait();
        await refreshEvents();

        setSalesStatus(receipt?.status === 1 ? "success" : "failed");
        setSalesMessage(receipt?.status === 1 ? "Ticket sales started successfully." : "Ticket-sales update returned a failed receipt.");
        session.setLatestTransaction({
          hash: tx.hash,
          receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
          blockNumber: receipt ? String(receipt.blockNumber) : "-",
          gasUsed: receipt ? receipt.gasUsed.toString() : "-",
          summary: receipt?.status === 1 ? "Ticket sales started." : "Ticket-sales update failed.",
        });
      });
    } catch (error) {
      setSalesStatus("failed");
      setSalesMessage(error instanceof Error ? error.message : "Ticket-sales update failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Ticket-sales update failed.",
      });
    }
  }

  return (
    <div className="page-stack">
      <section className="surface-card">
        <p className="eyebrow">Organizer studio</p>
        <h2 className="title is-3">Create Event</h2>
        <p className="subtitle is-6">Create an event, then configure ticket tiers, wallet caps, and ticket sales for the selected event.</p>
      </section>

      <div className="card-grid card-grid--two">
        <section className="surface-card">
          <p className="eyebrow">Step 1</p>
          <h3 className="title is-4">Create event</h3>
          <p className="meta-line mb-4">Events start in Draft state and can then be configured with ticket tiers and wallet caps.</p>
          <button className="button is-primary is-fullwidth" type="button" onClick={handleCreateEvent} disabled={eventStatus === "pending"}>
            {eventStatus === "pending" ? "Creating..." : "Create Event"}
          </button>
          {eventMessage ? (
            <p className={`help mt-4 ${eventStatus === "failed" ? "is-danger" : eventStatus === "success" ? "is-success" : ""}`}>{eventMessage}</p>
          ) : null}
        </section>

        <section className="surface-card">
          <p className="eyebrow">Selected event</p>
          <h3 className="title is-4">{selectedEvent ? `Event #${selectedEvent.eventId}` : "No event selected"}</h3>
          <p className="meta-line mb-4">
            {selectedEvent ? `${eventStateLabel(selectedEvent.state)} · Wallet cap ${selectedEvent.walletCap} · ${selectedEvent.nextTierId} tier(s)` : "Create an event to start configuring it."}
          </p>
          {!selectedEventIsDraft && selectedEvent ? (
            <p className="help is-warning mb-4">This event is no longer in Draft, so tier and wallet-cap changes are disabled.</p>
          ) : null}

          <div className="field">
            <label className="label" htmlFor="selected-event">
              Active event
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="selected-event"
                  value={selectedEventId ?? ""}
                  onChange={(event) => setSelectedEventId(event.target.value ? Number(event.target.value) : null)}
                >
                  {events.length === 0 ? <option value="">No events yet</option> : null}
                  {events.map((eventItem) => (
                    <option key={eventItem.eventId} value={eventItem.eventId}>
                      Event #{eventItem.eventId} · {eventStateLabel(eventItem.state)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="card-grid card-grid--two">
        <section className="surface-card">
          <p className="eyebrow">Step 2</p>
          <h3 className="title is-4">Create ticket tier</h3>

          <div className="field">
            <label className="label" htmlFor="tier-label">
              Tier label
            </label>
            <div className="control">
              <input id="tier-label" className="input" type="text" value={tierLabel} onChange={(event) => setTierLabel(event.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="tier-price">
              Price in CEC
            </label>
            <div className="control">
              <input
                id="tier-price"
                className="input"
                type="number"
                min="0"
                step="1"
                value={tierPrice}
                onChange={(event) => setTierPrice(event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="tier-supply">
              Max supply
            </label>
            <div className="control">
              <input
                id="tier-supply"
                className="input"
                type="number"
                min="1"
                step="1"
                value={tierSupply}
                onChange={(event) => setTierSupply(event.target.value)}
              />
            </div>
          </div>

          <button
            className="button is-primary is-fullwidth"
            type="button"
            onClick={handleCreateTier}
            disabled={tierStatus === "pending" || !selectedEventIsDraft}
          >
            {tierStatus === "pending" ? "Creating Tier..." : "Create Ticket Tier"}
          </button>
          {tierMessage ? (
            <p className={`help mt-4 ${tierStatus === "failed" ? "is-danger" : tierStatus === "success" ? "is-success" : ""}`}>{tierMessage}</p>
          ) : null}
        </section>

        <section className="surface-card">
          <p className="eyebrow">Step 3</p>
          <h3 className="title is-4">Wallet cap and sales</h3>

          <div className="field">
            <label className="label" htmlFor="wallet-cap">
              Wallet cap
            </label>
            <div className="control">
              <input
                id="wallet-cap"
                className="input"
                type="number"
                min="1"
                step="1"
                value={walletCap}
                onChange={(event) => setWalletCap(event.target.value)}
              />
            </div>
          </div>

          <button
            className="button is-light is-fullwidth"
            type="button"
            onClick={handleWalletCapUpdate}
            disabled={walletCapStatus === "pending" || !selectedEventIsDraft}
          >
            {walletCapStatus === "pending" ? "Updating Cap..." : "Update Wallet Cap"}
          </button>
          {walletCapMessage ? (
            <p className={`help mt-4 ${walletCapStatus === "failed" ? "is-danger" : walletCapStatus === "success" ? "is-success" : ""}`}>{walletCapMessage}</p>
          ) : null}

          <button
            className="button is-primary is-fullwidth mt-5"
            type="button"
            onClick={handleStartSales}
            disabled={salesStatus === "pending" || !selectedEventIsDraft}
          >
            {salesStatus === "pending" ? "Starting Sales..." : "Start Ticket Sales"}
          </button>
          {salesMessage ? (
            <p className={`help mt-4 ${salesStatus === "failed" ? "is-danger" : salesStatus === "success" ? "is-success" : ""}`}>{salesMessage}</p>
          ) : null}
        </section>
      </div>

      <TransactionEvidenceCard
        evidence={session.latestTransaction}
        statusLabel={session.latestTransaction?.receiptStatus ?? "Idle"}
        title="Latest organizer transaction"
      />
    </div>
  );
}

export function OrganizerStudioPage({ session }: OrganizerStudioPageProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);

  async function refreshEvents() {
    if (!session.provider || !session.account || !session.isCorrectNetwork) {
      setEvents([]);
      return [];
    }

    const organizerEvents = await readOrganizerEvents(session.provider, session.account);
    setEvents(organizerEvents);
    return organizerEvents;
  }

  useEffect(() => {
    void refreshEvents();
  }, [session.account, session.isCorrectNetwork, session.provider]);

  return (
    <RoleGuard
      allowedRole="organizer"
      currentRole={session.role}
      title="Organizer access only"
      message="Connect with an approved organizer wallet to manage events and ticket tiers."
    >
      <div className="page-stack">
        <PageIntro
          eyebrow="Organizer studio"
          title="Operational event management"
          summary="Create events, configure ticket tiers, set wallet caps, and start ticket sales from one organizer route."
        />

        <div className="page-with-sidebar">
          <aside className="role-sidebar">
            <p className="eyebrow">Studio</p>
            <nav className="role-sidebar__nav">
              <NavLink to="/organizer" end className={navClassName}>
                My Events
              </NavLink>
              <NavLink to="/organizer/create-event" className={navClassName}>
                Create Event
              </NavLink>
            </nav>
          </aside>

          <div className="page-with-sidebar__content">
            <Routes>
              <Route index element={<OrganizerEventsView events={events} />} />
              <Route path="create-event" element={<OrganizerCreateView session={session} events={events} refreshEvents={refreshEvents} />} />
              <Route path="*" element={<Navigate to="/organizer" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
