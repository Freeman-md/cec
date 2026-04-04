import { NavLink } from "react-router-dom";
import type { AppRole } from "../types/app";

type AppHeaderProps = {
  session: {
    role: AppRole;
    identity: {
      account: string;
      label: string;
    };
    chainLabel: string;
    creditsBalance: string;
    connectWallet: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    hasWallet: boolean;
    isCorrectNetwork: boolean;
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
        <div className="identity-chip">
          <span className="identity-chip__role">{session.identity.label}</span>
          <span className="identity-chip__account">{session.identity.account}</span>
          <span className="identity-chip__chain">{session.chainLabel}</span>
          {session.isConnected ? <span className="identity-chip__balance">{session.creditsBalance} CEC</span> : null}
        </div>

        <button
          className={`button ${session.isConnected ? "is-light" : "is-primary"}`}
          type="button"
          onClick={session.connectWallet}
          disabled={!session.hasWallet || session.isConnecting}
        >
          {session.isConnected
            ? session.isCorrectNetwork
              ? "Wallet Connected"
              : "Wrong Network"
            : session.isConnecting
              ? "Connecting..."
              : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}
