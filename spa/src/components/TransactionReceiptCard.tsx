import { formatCredits } from "../lib/format";
import type { ReceiptSummary } from "../hooks/useBuyCredits";

type TransactionReceiptCardProps = {
  receipt: ReceiptSummary | null;
  beforeBalance: bigint | null;
  afterBalance: bigint | null;
  error: string;
};

export function TransactionReceiptCard({
  receipt,
  beforeBalance,
  afterBalance,
  error,
}: TransactionReceiptCardProps) {
  return (
    <div className="box panel-card">
      <p className="subtle-label mb-2">Evidence</p>
      <h2 className="title is-4">Transaction Receipt</h2>

      {error ? <p className="has-text-danger mb-4">{error}</p> : null}

      {receipt ? (
        <div className="content mb-0">
          <p>
            <strong>Tx Hash:</strong>
            <span className="mono-data ml-2">{receipt.hash}</span>
          </p>
          <p>
            <strong>Status:</strong> {receipt.status}
          </p>
          <p>
            <strong>Block Number:</strong> {receipt.blockNumber}
          </p>
          <p>
            <strong>Gas Used:</strong> {receipt.gasUsed}
          </p>
          <p>
            <strong>Emitted Logs:</strong> {receipt.emittedLogCount}
          </p>
          <p>
            <strong>Credits Before:</strong> {formatCredits(beforeBalance)}
          </p>
          <p>
            <strong>Credits After:</strong> {formatCredits(afterBalance)}
          </p>
        </div>
      ) : (
        <p className="content mb-0">No transaction submitted yet.</p>
      )}
    </div>
  );
}
