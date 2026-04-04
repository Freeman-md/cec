import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { RoleGuard } from "../components/RoleGuard";
import type { AppRole } from "../types/app";

type OrganizerStudioPageProps = {
  session: {
    role: AppRole;
  };
};

function OrganizerPanel({ title, summary }: { title: string; summary: string }) {
  return (
    <section className="surface-card">
      <p className="eyebrow">Organizer studio</p>
      <h2 className="title is-3">{title}</h2>
      <p className="subtitle is-6">{summary}</p>
    </section>
  );
}

export function OrganizerStudioPage({ session }: OrganizerStudioPageProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined);

  return (
    <RoleGuard
      allowedRole="organizer"
      currentRole={session.role}
      title="Organizer access only"
      message="Switch the preview role to Organizer to work through the studio skeleton and sidebar layout."
    >
      <div className="page-stack">
        <PageIntro
          eyebrow="Organizer studio"
          title="Operational event management"
          summary="This layout intentionally keeps the sidebar minimal: My Events and Create Event only."
        />

        <div className="page-with-sidebar">
          <aside className="role-sidebar">
            <p className="eyebrow">Studio</p>
            <nav className="role-sidebar__nav">
              <NavLink to="/organizer" end className={navClassName}>
                My Events
              </NavLink>
              <NavLink to="/organizer/create-event" className={navClassName}>
                Create Event
              </NavLink>
            </nav>
          </aside>

          <div className="page-with-sidebar__content">
            <Routes>
              <Route
                index
                element={
                  <OrganizerPanel
                    title="My Events"
                    summary="Organizer-managed event list, event state, tier counts, and action entry points will live here."
                  />
                }
              />
              <Route
                path="create-event"
                element={
                  <OrganizerPanel
                    title="Create Event"
                    summary="Create event, create tier, set wallet cap, and start sales actions will be added in later slices."
                  />
                }
              />
              <Route path="*" element={<Navigate to="/organizer" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
