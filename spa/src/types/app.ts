import type { BrowserProvider } from "ethers";

export type AppRole = "student" | "organizer" | "admin";

export type SessionIdentity = {
  account: string;
  label: string;
};

export type TransactionEvidence = {
  hash: string;
  receiptStatus: string;
  blockNumber: string;
  gasUsed: string;
  beforeCreditsBalance?: string;
  afterCreditsBalance?: string;
  beforeEthBalance?: string;
  afterEthBalance?: string;
  summary?: string;
};

export type AppSession = {
  role: AppRole;
  identity: SessionIdentity;
  chainLabel: string;
  creditsBalance: string;
  refreshSession: () => Promise<void>;
  connectWallet: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  hasWallet: boolean;
  account: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  error: string | null;
  provider: BrowserProvider | null;
  latestTransaction: TransactionEvidence | null;
  setLatestTransaction: (evidence: TransactionEvidence | null) => void;
};
