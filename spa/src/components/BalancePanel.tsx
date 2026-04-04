import { formatCredits } from "../lib/format";

type BalancePanelProps = {
  tokenName: string;
  tokenSymbol: string;
  creditsBalance: bigint | null;
};

export function BalancePanel({ tokenName, tokenSymbol, creditsBalance }: BalancePanelProps) {
  return (
    <div className="box panel-card">
      <p className="subtle-label mb-2">Token State</p>
      <h2 className="title is-4">Credits Balance</h2>
      <div className="content mb-0">
        <p>
          <strong>Name:</strong> {tokenName || "Awaiting deployment info"}
        </p>
        <p>
          <strong>Symbol:</strong> {tokenSymbol || "CEC"}
        </p>
        <p>
          <strong>Balance:</strong> {formatCredits(creditsBalance)} {tokenSymbol || "CEC"}
        </p>
      </div>
    </div>
  );
}
