import { useMemo, useState } from "react";

export type AppRole = "student" | "organizer" | "admin";

type PreviewIdentity = {
  account: string;
  label: string;
};

type PreviewSession = {
  role: AppRole;
  identity: PreviewIdentity;
  chainLabel: string;
  setRole: (role: AppRole) => void;
};

const previewIdentities: Record<AppRole, PreviewIdentity> = {
  student: {
    account: "0x71C0...4F2",
    label: "Student",
  },
  organizer: {
    account: "0x0RG4...1Z3",
    label: "Approved Organizer",
  },
  admin: {
    account: "0xADm1...001",
    label: "Admin",
  },
};

export function usePreviewSession(): PreviewSession {
  const [role, setRole] = useState<AppRole>("student");

  return useMemo(
    () => ({
      role,
      identity: previewIdentities[role],
      chainLabel: "Hardhat Localhost · 31337",
      setRole,
    }),
    [role],
  );
}
