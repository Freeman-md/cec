import { PageIntro } from "../components/PageIntro";
import { RoleGuard } from "../components/RoleGuard";
import type { AppRole } from "../types/app";

type AdminConsolePageProps = {
  session: {
    role: AppRole;
  };
};

export function AdminConsolePage({ session }: AdminConsolePageProps) {
  return (
    <RoleGuard
      allowedRole="admin"
      currentRole={session.role}
      title="Admin access only"
      message="Switch the preview role to Admin to view the console skeleton. This route intentionally does not use a sidebar."
    >
      <div className="page-stack">
        <PageIntro
          eyebrow="Admin console"
          title="System control panel"
          summary="This route stays sidebar-free. It is reserved for organizer approval and exchange-rate management."
        />

        <div className="card-grid card-grid--two">
          <section className="surface-card">
            <p className="eyebrow">Organizer approval</p>
            <h2 className="title is-4">Approve organizers</h2>
            <p className="subtitle is-6">
              This panel will hold the role-management flow and on-chain approval state readback.
            </p>
          </section>

          <section className="surface-card">
            <p className="eyebrow">Exchange control</p>
            <h2 className="title is-4">Update ETH-to-CEC rate</h2>
            <p className="subtitle is-6">
              This panel will handle the admin-only rate change and show confirmation evidence after submission.
            </p>
          </section>
        </div>
      </div>
    </RoleGuard>
  );
}
