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
