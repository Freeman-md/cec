import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { PageFrame } from "./components/PageFrame";
import { useAppSession } from "./hooks/useAppSession";
import { AdminConsolePage } from "./pages/AdminConsolePage";
import { CreditsPurchasePage } from "./pages/CreditsPurchasePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { OrganizerStudioPage } from "./pages/OrganizerStudioPage";
import { WalletDashboardPage } from "./pages/WalletDashboardPage";

export function App() {
  const session = useAppSession();
  const footerNavClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined);

  return (
    <BrowserRouter>
      <PageFrame
        header={<AppHeader session={session} />}
        footer={
          <footer className="app-footer">
            <div>
              <p className="footer-brand">NeonCurator</p>
              <p className="footer-copy">Role-aware campus event ticketing dApp for the final CW2 rebuild.</p>
            </div>
            <div className="footer-links">
              <NavLink to="/" className={footerNavClassName}>
                Discover
              </NavLink>
              <NavLink to="/my-tickets" className={footerNavClassName}>
                My Tickets
              </NavLink>
              <NavLink to="/wallet" className={footerNavClassName}>
                Wallet
              </NavLink>
            </div>
          </footer>
        }
      >
        <Routes>
          <Route path="/" element={<DiscoverPage session={session} />} />
          <Route path="/events/:eventSlug" element={<EventDetailPage session={session} />} />
          <Route path="/credits" element={<CreditsPurchasePage session={session} />} />
          <Route path="/my-tickets" element={<MyTicketsPage session={session} />} />
          <Route path="/wallet" element={<WalletDashboardPage session={session} />} />
          <Route path="/organizer/*" element={<OrganizerStudioPage session={session} />} />
          <Route path="/admin" element={<AdminConsolePage session={session} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageFrame>
    </BrowserRouter>
  );
}
