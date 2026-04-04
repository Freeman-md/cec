import { NavLink } from "react-router-dom";
import type { AppRole } from "../hooks/usePreviewSession";

type AppHeaderProps = {
  session: {
    role: AppRole;
    identity: {
      account: string;
      label: string;
    };
    chainLabel: string;
    setRole: (role: AppRole) => void;
  };
};

export function AppHeader({ session }: AppHeaderProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="brand-mark">NeonCurator</span>
      </div>

      <nav className="app-header__nav">
        <NavLink to="/" className={navClassName}>
          Discover
        </NavLink>
        <NavLink to="/my-tickets" className={navClassName}>
          My Tickets
        </NavLink>
        <NavLink to="/wallet" className={navClassName}>
          Wallet
        </NavLink>
        {session.role === "organizer" ? (
          <NavLink to="/organizer" className={navClassName}>
            Organizer Studio
          </NavLink>
        ) : null}
        {session.role === "admin" ? (
          <NavLink to="/admin" className={navClassName}>
            Admin Console
          </NavLink>
        ) : null}
      </nav>

      <div className="app-header__controls">
        <div className="preview-role-control">
          <label htmlFor="role-select" className="preview-role-control__label">
            Preview Role
          </label>
          <div className="select is-small">
            <select
              id="role-select"
              value={session.role}
              onChange={(event) => session.setRole(event.target.value as AppRole)}
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="identity-chip">
          <span className="identity-chip__role">{session.identity.label}</span>
          <span className="identity-chip__account">{session.identity.account}</span>
          <span className="identity-chip__chain">{session.chainLabel}</span>
        </div>
      </div>
    </header>
  );
}
