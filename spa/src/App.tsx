import contractInfo from "./config/contract-info.json";

export function App() {
  return (
    <main className="app-shell">
      <section className="section">
        <div className="container is-max-desktop">
          <div className="hero-card">
            <p className="eyebrow">Phase 6 rebuild</p>
            <h1 className="title is-1">NeonCurator SPA</h1>
            <p className="subtitle is-5">
              The frontend has been reset to a clean boilerplate so the final UI can be rebuilt
              iteratively from the Stitch-approved designs and the Phase 6 checklist.
            </p>
          </div>

          <div className="columns is-variable is-5 mt-2">
            <div className="column is-7">
              <div className="panel-card">
                <p className="eyebrow">Next implementation order</p>
                <ol className="content ordered-list">
                  <li>Lock the final Stitch direction.</li>
                  <li>Rebuild the shared shell and dynamic role-aware header.</li>
                  <li>Implement role detection and contract helpers.</li>
                  <li>Build Discover, Event Detail, and Credits Purchase.</li>
                  <li>Add My Tickets, Wallet Dashboard, Organizer Studio, and Admin Console.</li>
                </ol>
              </div>
            </div>

            <div className="column is-5">
              <div className="panel-card">
                <p className="eyebrow">Local contract bridge</p>
                <div className="content">
                  <p>
                    The deploy script still writes contract metadata to
                    <code> src/config/contract-info.json</code>.
                  </p>
                  <ul>
                    <li>Network: {contractInfo.networkName}</li>
                    <li>Chain ID: {contractInfo.chainId}</li>
                    <li>CreditsToken: {contractInfo.creditsToken.address}</li>
                    <li>EventPlatform: {contractInfo.eventPlatform.address}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
