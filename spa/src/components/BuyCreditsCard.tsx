import { FormEvent, useState } from "react";

type BuyCreditsCardProps = {
  isSubmitting: boolean;
  onBuyCredits: (ethAmount: string) => Promise<void>;
};

export function BuyCreditsCard({ isSubmitting, onBuyCredits }: BuyCreditsCardProps) {
  const [ethAmount, setEthAmount] = useState("1");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onBuyCredits(ethAmount);
  };

  return (
    <div className="box panel-card">
      <p className="subtle-label mb-2">Transaction</p>
      <h2 className="title is-4">Buy Credits</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <div className="field">
          <label className="label" htmlFor="ethAmount">
            ETH Amount
          </label>
          <div className="control">
            <input
              id="ethAmount"
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={ethAmount}
              onChange={(event) => setEthAmount(event.target.value)}
            />
          </div>
          <p className="help">This calls `buyCreditsWithEth()` on the local Hardhat deployment.</p>
        </div>

        <button className={`button is-link ${isSubmitting ? "is-loading" : ""}`} type="submit">
          Buy Credits
        </button>
      </form>
    </div>
  );
}
