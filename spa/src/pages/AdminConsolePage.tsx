import { isAddress } from "ethers";
import { useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { TransactionEvidenceCard } from "../components/TransactionEvidenceCard";
import { RoleGuard } from "../components/RoleGuard";
import { getAppContracts, readExchangeRate } from "../lib/contracts";
import type { AppSession } from "../types/app";

type AdminConsolePageProps = {
  session: AppSession;
};

type ActionStatus = "idle" | "pending" | "success" | "failed";

function formatRate(value: bigint) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function AdminConsolePage({ session }: AdminConsolePageProps) {
  const [organizerAddress, setOrganizerAddress] = useState("");
  const [organizerApproved, setOrganizerApproved] = useState<boolean | null>(null);
  const [organizerStatus, setOrganizerStatus] = useState<ActionStatus>("idle");
  const [organizerMessage, setOrganizerMessage] = useState("");

  const [rateInput, setRateInput] = useState("");
  const [currentRate, setCurrentRate] = useState<bigint>(0n);
  const [rateStatus, setRateStatus] = useState<ActionStatus>("idle");
  const [rateMessage, setRateMessage] = useState("");

  useEffect(() => {
    async function hydrateAdminConsole() {
      if (!session.provider || !session.isCorrectNetwork) {
        setCurrentRate(0n);
        return;
      }

      const rate = await readExchangeRate(session.provider);
      setCurrentRate(rate);
      if (!rateInput) {
        setRateInput(rate > 0n ? String(rate) : "");
      }
    }

    void hydrateAdminConsole();
  }, [rateInput, session.isCorrectNetwork, session.provider]);

  useEffect(() => {
    async function hydrateOrganizerStatus() {
      if (!session.provider || !session.isCorrectNetwork || !isAddress(organizerAddress)) {
        setOrganizerApproved(null);
        return;
      }

      const { eventPlatform } = getAppContracts(session.provider);
      const approved = Boolean(await eventPlatform.approvedOrganizers(organizerAddress));
      setOrganizerApproved(approved);
    }

    void hydrateOrganizerStatus();
  }, [organizerAddress, session.isCorrectNetwork, session.provider]);

  async function handleApproveOrganizer() {
    if (!session.provider || !session.account || !session.isConnected) {
      session.connectWallet();
      return;
    }

    if (!session.isCorrectNetwork) {
      setOrganizerStatus("failed");
      setOrganizerMessage("Switch to the configured localhost network to manage organizers.");
      return;
    }

    if (!isAddress(organizerAddress)) {
      setOrganizerStatus("failed");
      setOrganizerMessage("Enter a valid organizer wallet address.");
      return;
    }

    try {
      setOrganizerStatus("pending");
      setOrganizerMessage("");

      const signer = await session.provider.getSigner();
      const { eventPlatform } = getAppContracts(signer);
      const tx = await eventPlatform.approveOrganizer(organizerAddress, true);

      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: "Pending",
        blockNumber: "-",
        gasUsed: "-",
        summary: `Approving organizer ${organizerAddress.slice(0, 6)}...${organizerAddress.slice(-4)}.`,
      });

      const receipt = await tx.wait();
      const { eventPlatform: platformReader } = getAppContracts(session.provider);
      const approved = Boolean(await platformReader.approvedOrganizers(organizerAddress));

      setOrganizerApproved(approved);
      setOrganizerStatus(receipt?.status === 1 ? "success" : "failed");
      setOrganizerMessage(
        receipt?.status === 1 ? "Organizer approved successfully." : "Organizer approval returned a failed receipt.",
      );
      await session.refreshSession();

      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
        blockNumber: receipt ? String(receipt.blockNumber) : "-",
        gasUsed: receipt ? receipt.gasUsed.toString() : "-",
        summary: receipt?.status === 1 ? "Organizer approved successfully." : "Organizer approval failed.",
      });
    } catch (error) {
      setOrganizerStatus("failed");
      setOrganizerMessage(error instanceof Error ? error.message : "Organizer approval failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Organizer approval failed.",
      });
    }
  }

  async function handleRateUpdate() {
    if (!session.provider || !session.account || !session.isConnected) {
      session.connectWallet();
      return;
    }

    if (!session.isCorrectNetwork) {
      setRateStatus("failed");
      setRateMessage("Switch to the configured localhost network to update the exchange rate.");
      return;
    }

    const parsedRate = Number(rateInput);
    if (!Number.isFinite(parsedRate) || parsedRate <= 0 || !Number.isInteger(parsedRate)) {
      setRateStatus("failed");
      setRateMessage("Enter a whole-number rate greater than zero.");
      return;
    }

    try {
      setRateStatus("pending");
      setRateMessage("");

      const signer = await session.provider.getSigner();
      const { eventPlatform } = getAppContracts(signer);
      const tx = await eventPlatform.updateEthToCreditsRate(BigInt(parsedRate));

      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: "Pending",
        blockNumber: "-",
        gasUsed: "-",
        summary: `Updating exchange rate to ${parsedRate} CEC per ETH.`,
      });

      const receipt = await tx.wait();
      const refreshedRate = await readExchangeRate(session.provider);
      setCurrentRate(refreshedRate);
      setRateInput(String(refreshedRate));
      setRateStatus(receipt?.status === 1 ? "success" : "failed");
      setRateMessage(
        receipt?.status === 1 ? "Exchange rate updated successfully." : "Exchange-rate update returned a failed receipt.",
      );

      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
        blockNumber: receipt ? String(receipt.blockNumber) : "-",
        gasUsed: receipt ? receipt.gasUsed.toString() : "-",
        summary: receipt?.status === 1 ? `Exchange rate updated to ${refreshedRate} CEC per ETH.` : "Exchange-rate update failed.",
      });
    } catch (error) {
      setRateStatus("failed");
      setRateMessage(error instanceof Error ? error.message : "Exchange-rate update failed.");
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "Exchange-rate update failed.",
      });
    }
  }

  return (
    <RoleGuard
      allowedRole="admin"
      currentRole={session.role}
      title="Admin access only"
      message="Connect with the admin wallet to approve organizers and manage the exchange rate."
    >
      <div className="page-stack">
        <PageIntro
          eyebrow="Admin console"
          title="System control panel"
          summary="Manage organizer approval and the ETH-to-CEC exchange rate from one admin-only route."
        />

        <div className="card-grid card-grid--two">
          <section className="surface-card">
            <p className="eyebrow">Organizer approval</p>
            <h2 className="title is-4">Approve organizers</h2>
            <p className="meta-line mb-4">Enter a wallet address and approve it for organizer actions on-chain.</p>

            <div className="field">
              <label className="label" htmlFor="organizer-address">
                Organizer wallet address
              </label>
              <div className="control">
                <input
                  id="organizer-address"
                  className="input"
                  type="text"
                  placeholder="0x..."
                  value={organizerAddress}
                  onChange={(event) => setOrganizerAddress(event.target.value.trim())}
                />
              </div>
            </div>

            <div className="simple-panel mt-4">
              <p className="meta-line">Current status</p>
              <p className="title is-5">
                {organizerApproved === null ? "Enter a valid address" : organizerApproved ? "Approved organizer" : "Not approved"}
              </p>
            </div>

            <button
              className="button is-primary is-fullwidth mt-4"
              type="button"
              onClick={handleApproveOrganizer}
              disabled={organizerStatus === "pending"}
            >
              {organizerStatus === "pending" ? "Approving..." : "Approve Organizer"}
            </button>

            {organizerMessage ? (
              <p className={`help mt-4 ${organizerStatus === "failed" ? "is-danger" : organizerStatus === "success" ? "is-success" : ""}`}>
                {organizerMessage}
              </p>
            ) : null}
          </section>

          <section className="surface-card">
            <p className="eyebrow">Exchange control</p>
            <h2 className="title is-4">Update ETH-to-CEC rate</h2>
            <p className="meta-line mb-4">Set the number of CEC minted for each 1 ETH sent to the platform.</p>

            <div className="simple-panel">
              <p className="meta-line">Current exchange rate</p>
              <p className="title is-5">1 ETH = {formatRate(currentRate)} CEC</p>
            </div>

            <div className="field mt-4">
              <label className="label" htmlFor="exchange-rate">
                New CEC per ETH
              </label>
              <div className="control">
                <input
                  id="exchange-rate"
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={rateInput}
                  onChange={(event) => setRateInput(event.target.value)}
                />
              </div>
            </div>

            <button
              className="button is-primary is-fullwidth mt-4"
              type="button"
              onClick={handleRateUpdate}
              disabled={rateStatus === "pending"}
            >
              {rateStatus === "pending" ? "Updating..." : "Update Exchange Rate"}
            </button>

            {rateMessage ? (
              <p className={`help mt-4 ${rateStatus === "failed" ? "is-danger" : rateStatus === "success" ? "is-success" : ""}`}>
                {rateMessage}
              </p>
            ) : null}
          </section>
        </div>

        <TransactionEvidenceCard
          evidence={session.latestTransaction}
          statusLabel={session.latestTransaction?.receiptStatus ?? "Idle"}
          title="Latest admin transaction"
        />
      </div>
    </RoleGuard>
  );
}
