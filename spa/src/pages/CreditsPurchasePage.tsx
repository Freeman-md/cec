import { formatEther, parseEther } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { TransactionEvidenceCard } from "../components/TransactionEvidenceCard";
import { getAppContracts, readCreditsBalance, readExchangeRate } from "../lib/contracts";
import type { AppRole } from "../types/app";

type CreditsPurchasePageProps = {
  session: {
    role: AppRole;
    provider: Awaited<ReturnType<typeof import("../lib/ethereum").createBrowserProvider>>;
    account: string | null;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    creditsBalance: string;
    refreshSession: () => Promise<void>;
    connectWallet: () => void;
    latestTransaction: import("../types/app").TransactionEvidence | null;
    setLatestTransaction: (evidence: import("../types/app").TransactionEvidence | null) => void;
  };
};

type TransactionStatus = "idle" | "pending" | "success" | "failed";

function formatDisplayAmount(value: string, maximumFractionDigits = 4) {
  const asNumber = Number(value);

  if (Number.isNaN(asNumber)) {
    return "0";
  }

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(asNumber);
}

export function CreditsPurchasePage({ session }: CreditsPurchasePageProps) {
  const [ethAmount, setEthAmount] = useState("0.10");
  const [exchangeRate, setExchangeRate] = useState(0n);
  const [ethBalance, setEthBalance] = useState("0");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [beforeCreditsBalance, setBeforeCreditsBalance] = useState("0");
  const [afterCreditsBalance, setAfterCreditsBalance] = useState("0");
  const [beforeEthBalance, setBeforeEthBalance] = useState("0");
  const [afterEthBalance, setAfterEthBalance] = useState("0");

  useEffect(() => {
    async function hydratePurchasePage() {
      if (!session.provider || !session.account || !session.isCorrectNetwork) {
        setExchangeRate(0n);
        setEthBalance("0");
        return;
      }

      const [rate, balance] = await Promise.all([
        readExchangeRate(session.provider),
        session.provider.getBalance(session.account),
      ]);

      setExchangeRate(rate);
      setEthBalance(formatEther(balance));
    }

    void hydratePurchasePage();
  }, [session.account, session.isCorrectNetwork, session.provider, session.creditsBalance]);

  const parsedEthAmount = useMemo(() => {
    try {
      return parseEther(ethAmount || "0");
    } catch {
      return 0n;
    }
  }, [ethAmount]);

  const cecToReceive = useMemo(() => {
    if (exchangeRate === 0n || parsedEthAmount === 0n) {
      return "0";
    }

    return formatEther(parsedEthAmount * exchangeRate);
  }, [exchangeRate, parsedEthAmount]);

  const nextEthBalance = useMemo(() => {
    const currentBalance = Number(ethBalance);
    const spendAmount = Number(ethAmount || "0");

    if (Number.isNaN(currentBalance) || Number.isNaN(spendAmount)) {
      return "0";
    }

    return String(Math.max(currentBalance - spendAmount, 0));
  }, [ethAmount, ethBalance]);

  const nextCreditsBalance = useMemo(() => {
    const currentBalance = Number(session.creditsBalance);
    const purchaseAmount = Number(cecToReceive);

    if (Number.isNaN(currentBalance) || Number.isNaN(purchaseAmount)) {
      return "0";
    }

    return String(currentBalance + purchaseAmount);
  }, [cecToReceive, session.creditsBalance]);

  async function handlePurchase() {
    if (!session.provider || !session.account || !session.isConnected) {
      session.connectWallet();
      return;
    }

    if (!session.isCorrectNetwork) {
      setStatus("failed");
      setErrorMessage("Switch to the configured local Hardhat network before purchasing credits.");
      return;
    }

    if (parsedEthAmount <= 0n) {
      setStatus("failed");
      setErrorMessage("Enter a valid ETH amount greater than zero.");
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");
      const startingCreditsBalance = session.creditsBalance;
      const startingEthBalance = ethBalance;
      setBeforeCreditsBalance(startingCreditsBalance);
      setBeforeEthBalance(startingEthBalance);

      const signer = await session.provider.getSigner();
      const { eventPlatform } = getAppContracts(signer);
      const tx = await eventPlatform.buyCreditsWithEth({ value: parsedEthAmount });

      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: "Pending",
        blockNumber: "-",
        gasUsed: "-",
        summary: "CEC credit purchase submitted.",
      });

      const receipt = await tx.wait();
      await session.refreshSession();

      const [refreshedEthBalance, refreshedCreditsBalance] = await Promise.all([
        session.provider.getBalance(session.account),
        readCreditsBalance(session.provider, session.account),
      ]);
      const refreshedEthBalanceDisplay = formatEther(refreshedEthBalance);

      setAfterCreditsBalance(refreshedCreditsBalance);
      setAfterEthBalance(refreshedEthBalanceDisplay);
      setEthBalance(refreshedEthBalanceDisplay);
      setStatus("success");
      session.setLatestTransaction({
        hash: tx.hash,
        receiptStatus: receipt?.status === 1 ? "Confirmed" : "Failed",
        blockNumber: receipt ? String(receipt.blockNumber) : "-",
        gasUsed: receipt ? receipt.gasUsed.toString() : "-",
        beforeCreditsBalance: formatDisplayAmount(startingCreditsBalance),
        afterCreditsBalance: formatDisplayAmount(refreshedCreditsBalance),
        beforeEthBalance: `${formatDisplayAmount(startingEthBalance)} ETH`,
        afterEthBalance: `${formatDisplayAmount(refreshedEthBalanceDisplay)} ETH`,
        summary: "CEC credits purchased successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed.";
      setStatus("failed");
      setErrorMessage(message);
      session.setLatestTransaction({
        hash: "-",
        receiptStatus: "Failed",
        blockNumber: "-",
        gasUsed: "-",
        summary: "CEC credit purchase failed.",
      });
    }
  }

  const statusClassName =
    status === "success"
      ? "status-pill status-pill--success"
      : status === "failed"
        ? "status-pill status-pill--error"
        : status === "pending"
          ? "status-pill status-pill--info"
          : "status-pill status-pill--used";

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Credits purchase"
        title="Buy CEC Tokens"
        summary="This page handles the first real UI-triggered on-chain transaction for the CW2 SPA: buying CEC with ETH."
      />

      <div className="page-two-column">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Purchase flow</p>
              <h2 className="title is-4">Simple ETH to CEC purchase</h2>
            </div>
            <span className="status-pill status-pill--info">Role: {session.role}</span>
          </div>

          <div className="field">
            <label className="label" htmlFor="eth-amount">
              ETH amount
            </label>
            <div className="control">
              <input
                id="eth-amount"
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={ethAmount}
                onChange={(event) => setEthAmount(event.target.value)}
              />
            </div>
          </div>

          <div className="placeholder-stack">
            <div className="placeholder-card">
              <p className="placeholder-label">Exchange rate</p>
              <p className="placeholder-value placeholder-value--small">1 ETH = {exchangeRate.toString()} CEC</p>
            </div>
            <div className="placeholder-card">
              <p className="placeholder-label">You receive</p>
              <p className="placeholder-value">{formatDisplayAmount(cecToReceive)} CEC</p>
            </div>
            <div className="placeholder-inline-grid">
              <div className="placeholder-card">
                <p className="placeholder-label">Current ETH balance</p>
                <p className="placeholder-value placeholder-value--small">{formatDisplayAmount(ethBalance)} ETH</p>
              </div>
              <div className="placeholder-card">
                <p className="placeholder-label">Current CEC balance</p>
                <p className="placeholder-value placeholder-value--small">
                  {formatDisplayAmount(session.creditsBalance)} CEC
                </p>
              </div>
            </div>
            <div className="placeholder-inline-grid">
              <div className="placeholder-card">
                <p className="placeholder-label">Projected ETH balance</p>
                <p className="placeholder-value placeholder-value--small">
                  {formatDisplayAmount(nextEthBalance)} ETH
                </p>
              </div>
              <div className="placeholder-card">
                <p className="placeholder-label">Projected CEC balance</p>
                <p className="placeholder-value placeholder-value--small">
                  {formatDisplayAmount(nextCreditsBalance)} CEC
                </p>
              </div>
            </div>
          </div>

          {errorMessage ? <p className="help is-danger mt-4">{errorMessage}</p> : null}

          <div className="buttons mt-4">
            <button className="button is-primary" type="button" onClick={handlePurchase} disabled={status === "pending"}>
              {status === "pending" ? "Confirming..." : "Confirm Purchase"}
            </button>
            {!session.isConnected ? (
              <button className="button is-light" type="button" onClick={session.connectWallet}>
                Connect Wallet
              </button>
            ) : null}
          </div>
        </section>

        <TransactionEvidenceCard
          evidence={session.latestTransaction}
          statusLabel={status.toUpperCase()}
          title="Live receipt surface"
        />
      </div>
    </div>
  );
}
