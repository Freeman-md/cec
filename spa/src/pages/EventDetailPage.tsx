import { formatUnits } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { demoEvents, type DemoEventSlug } from "../data/demoEvents";
import {
  getAppContracts,
  getDemoData,
  readCreditsAllowance,
  readEventSnapshot,
  readWalletPurchases,
} from "../lib/contracts";
import type { AppRole } from "../types/app";

type EventDetailPageProps = {
  session: {
    role: AppRole;
    provider: Awaited<ReturnType<typeof import("../lib/ethereum").createBrowserProvider>>;
    account: string | null;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    creditsBalance: string;
    refreshSession: () => Promise<void>;
    connectWallet: () => void;
  };
};

type TierView = {
  tierId: number;
  label: string;
  priceLabel: string;
  stockLabel: string;
  isSoldOut: boolean;
  priceInCredits: bigint;
};

type ActionStatus = "idle" | "pending" | "success" | "failed";

const demoData = getDemoData();

function eventStateLabel(eventState: number) {
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

function formatCec(balance: string) {
  const asNumber = Number(balance);

  if (Number.isNaN(asNumber)) {
    return "0";
  }

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(asNumber);
}

export function EventDetailPage({ session }: EventDetailPageProps) {
  const { eventSlug = demoData.featuredEventSlug } = useParams();
  const resolvedSlug = (eventSlug in demoEvents ? eventSlug : demoData.featuredEventSlug) as DemoEventSlug;
  const content = demoEvents[resolvedSlug];

  const [tiers, setTiers] = useState<TierView[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [eventState, setEventState] = useState(0);
  const [walletCap, setWalletCap] = useState(0);
  const [walletPurchases, setWalletPurchasesCount] = useState(0);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    async function hydrateEventDetail() {
      if (!session.provider || !session.account || !session.isCorrectNetwork) {
        setTiers([]);
        setSelectedTierId(null);
        setEventState(0);
        setWalletCap(0);
        setWalletPurchasesCount(0);
        setAllowance(0n);
        return;
      }

      const [snapshot, purchaseCount, currentAllowance] = await Promise.all([
        readEventSnapshot(session.provider, demoData.featuredEventId, demoData.tierIds),
        readWalletPurchases(session.provider, demoData.featuredEventId, session.account),
        readCreditsAllowance(session.provider, session.account),
      ]);

      const mappedTiers = snapshot.tiers.map((tier) => ({
        tierId: tier.tierId,
        label: tier.label,
        priceLabel: `${formatCec(formatUnits(tier.priceInCredits, 18))} CEC`,
        stockLabel:
          tier.maxSupply === 0
            ? "Unavailable"
            : tier.soldCount >= tier.maxSupply
              ? "Sold out"
              : `${tier.maxSupply - tier.soldCount} left`,
        isSoldOut: tier.maxSupply === 0 || tier.soldCount >= tier.maxSupply,
        priceInCredits: tier.priceInCredits,
      }));

      setTiers(mappedTiers);
      setSelectedTierId((currentSelected) => currentSelected ?? mappedTiers.find((tier) => !tier.isSoldOut)?.tierId ?? null);
      setEventState(snapshot.eventState);
      setWalletCap(snapshot.walletCap);
      setWalletPurchasesCount(purchaseCount);
      setAllowance(currentAllowance);
    }

    void hydrateEventDetail();
  }, [session.account, session.creditsBalance, session.isCorrectNetwork, session.provider]);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.tierId === selectedTierId) ?? null,
    [selectedTierId, tiers],
  );

  const creditsBalanceValue = Number(session.creditsBalance);
  const selectedTierPrice = Number(selectedTier ? formatUnits(selectedTier.priceInCredits, 18) : "0");
  const needsApproval = selectedTier ? allowance < selectedTier.priceInCredits : false;
  const walletCapReached = walletCap > 0 && walletPurchases >= walletCap;
  const insufficientCredits = selectedTier ? creditsBalanceValue < selectedTierPrice : false;
  const eventNotOnSale = eventState !== 1;

  const blockingMessage = selectedTier?.isSoldOut
    ? "This tier is sold out."
    : eventNotOnSale
      ? `This event is currently ${eventStateLabel(eventState).toLowerCase()}.`
      : walletCapReached
        ? "You have reached the per-wallet cap for this event."
        : insufficientCredits
          ? "Your current CEC balance is too low for the selected tier."
          : "";

  async function refreshEventState() {
    if (!session.provider || !session.account || !session.isCorrectNetwork) {
      return;
    }

    const [snapshot, purchaseCount, currentAllowance] = await Promise.all([
      readEventSnapshot(session.provider, demoData.featuredEventId, demoData.tierIds),
      readWalletPurchases(session.provider, demoData.featuredEventId, session.account),
      readCreditsAllowance(session.provider, session.account),
    ]);

    setTiers(
      snapshot.tiers.map((tier) => ({
        tierId: tier.tierId,
        label: tier.label,
        priceLabel: `${formatCec(formatUnits(tier.priceInCredits, 18))} CEC`,
        stockLabel:
          tier.maxSupply === 0
            ? "Unavailable"
            : tier.soldCount >= tier.maxSupply
              ? "Sold out"
              : `${tier.maxSupply - tier.soldCount} left`,
        isSoldOut: tier.maxSupply === 0 || tier.soldCount >= tier.maxSupply,
        priceInCredits: tier.priceInCredits,
      })),
    );
    setEventState(snapshot.eventState);
    setWalletCap(snapshot.walletCap);
    setWalletPurchasesCount(purchaseCount);
    setAllowance(currentAllowance);
  }

  async function handleApprove() {
    if (!session.provider || !session.account || !selectedTier || !session.isConnected) {
      session.connectWallet();
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");
      setResultMessage("");

      const signer = await session.provider.getSigner();
      const { creditsToken, eventPlatform } = getAppContracts(signer);
      const tx = await creditsToken.approve(await eventPlatform.getAddress(), selectedTier.priceInCredits);
      await tx.wait();
      await refreshEventState();

      setStatus("success");
      setResultMessage(`Approved ${selectedTier.label} for purchase.`);
    } catch (error) {
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "Approval failed.");
    }
  }

  async function handlePurchase() {
    if (!session.provider || !session.account || !selectedTier || !session.isConnected) {
      session.connectWallet();
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");
      setResultMessage("");

      const signer = await session.provider.getSigner();
      const { eventPlatform } = getAppContracts(signer);
      const tx = await eventPlatform.obtainTicketWithCredits(demoData.featuredEventId, selectedTier.tierId);
      const receipt = await tx.wait();

      await session.refreshSession();
      await refreshEventState();

      setStatus("success");
      setResultMessage(
        receipt?.status === 1
          ? `${selectedTier.label} purchased successfully. Ticket minted on-chain.`
          : "Purchase transaction completed with a non-success receipt.",
      );
    } catch (error) {
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "Ticket purchase failed.");
    }
  }

  const actionButtonLabel = needsApproval ? "Approve CEC" : "Purchase Selected Ticket";

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow={content.eyebrow}
        title={content.title}
        summary={content.summary}
      />

      <div className="page-two-column">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Event overview</p>
              <h2 className="title is-4">{content.category}</h2>
            </div>
            <span className="status-pill status-pill--info">{eventStateLabel(eventState)}</span>
          </div>
          <div className="info-list">
            <div className="info-block">
              <h3 className="title is-6">Date and time</h3>
              <p className="meta-line">
                {content.dateLabel} · {content.timeLabel}
              </p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Venue</h3>
              <p className="meta-line">{content.venue}</p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Organizer</h3>
              <p className="meta-line">{content.organizerName}</p>
              <p className="subtitle is-6">{content.organizerSummary}</p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Why this proves CW2</h3>
              <ul className="simple-list">
                {content.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Ticket tiers</p>
              <h2 className="title is-4">Purchase area</h2>
            </div>
            <span className="status-pill status-pill--active">{formatCec(session.creditsBalance)} CEC available</span>
          </div>
          <div className="tier-stack">
            {tiers.map((tier) => (
              <button
                key={tier.tierId}
                className={`tier-card ${selectedTierId === tier.tierId ? "tier-card--selected" : ""} ${tier.isSoldOut ? "tier-card--disabled" : ""}`}
                type="button"
                onClick={() => setSelectedTierId(tier.tierId)}
                disabled={tier.isSoldOut}
              >
                <h3 className="title is-5">{tier.label}</h3>
                <p className="meta-line">{tier.priceLabel}</p>
                <p className="meta-line">{tier.stockLabel}</p>
              </button>
            ))}
          </div>

          <div className="info-list mt-4">
            <div className="info-block">
              <h3 className="title is-6">Wallet cap</h3>
              <p className="meta-line">
                {walletCap || "-"} ticket(s) per wallet · You already hold {walletPurchases}
              </p>
            </div>
            <div className="info-block">
              <h3 className="title is-6">Allowance status</h3>
              <p className="meta-line">{selectedTier ? (needsApproval ? "Approval required before purchase" : "Allowance ready for purchase") : "Select a tier"}</p>
            </div>
          </div>

          <div className="buttons mt-4">
            <button
              className="button is-primary"
              type="button"
              disabled={
                status === "pending" ||
                !selectedTier ||
                Boolean(blockingMessage && !needsApproval) ||
                !session.isConnected ||
                !session.isCorrectNetwork
              }
              onClick={needsApproval ? handleApprove : handlePurchase}
            >
              {status === "pending" ? "Processing..." : actionButtonLabel}
            </button>
            <Link className="button is-light" to="/credits">
              Buy More Credits
            </Link>
          </div>

          {blockingMessage ? <p className="help is-danger mt-4">{blockingMessage}</p> : null}
          {errorMessage ? <p className="help is-danger mt-4">{errorMessage}</p> : null}
          {resultMessage ? <p className="help is-success mt-4">{resultMessage}</p> : null}
        </section>
      </div>
    </div>
  );
}
