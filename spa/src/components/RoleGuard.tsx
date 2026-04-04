import type { ReactNode } from "react";
import type { AppRole } from "../hooks/usePreviewSession";

type RoleGuardProps = {
  allowedRole: AppRole;
  currentRole: AppRole;
  title: string;
  message: string;
  children: ReactNode;
};

export function RoleGuard({ allowedRole, currentRole, title, message, children }: RoleGuardProps) {
  if (currentRole !== allowedRole) {
    return (
      <section className="surface-card access-card">
        <p className="eyebrow">Access restriction</p>
        <h2 className="title is-3">{title}</h2>
        <p className="subtitle is-6">{message}</p>
      </section>
    );
  }

  return <>{children}</>;
}
