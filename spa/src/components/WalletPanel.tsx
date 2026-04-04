import { shortenAddress } from "../lib/format";

type WalletPanelProps = {
  account: string;
  chainId: bigint | null;
  error: string;
  onConnect: () => Promise<void>;
};

export function WalletPanel({ account, chainId, error, onConnect }: WalletPanelProps) {
  return (
    <div className="box panel-card">
      <div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
        <div>
          <p className="subtle-label mb-2">Wallet</p>
          <h2 className="title is-4">Connection</h2>
        </div>
        <button className="button is-link is-light" onClick={() => void onConnect()}>
          {account ? "Reconnect" : "Connect Wallet"}
        </button>
      </div>

      <div className="content mb-0">
        <p>
          <strong>Account:</strong> {account ? shortenAddress(account) : "Not connected"}
        </p>
        <p>
          <strong>Chain ID:</strong> {chainId ? chainId.toString() : "Unknown"}
        </p>
        {error ? <p className="has-text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
