import contractInfo from "../config/contract-info.json";
import { hasDeployedContracts } from "../lib/contracts";

export function DeploymentStatusCard() {
  const isReady = hasDeployedContracts();

  return (
    <div className="box panel-card">
      <p className="subtle-label mb-2">Local Setup</p>
      <h2 className="title is-4">Deployment Status</h2>
      <div className="content mb-0">
        <p>
          <strong>Network:</strong> {contractInfo.networkName} ({contractInfo.chainId})
        </p>
        <p>
          <strong>EventPlatform:</strong>{" "}
          <span className="mono-data">{contractInfo.eventPlatform.address}</span>
        </p>
        <p>
          <strong>CreditsToken:</strong>{" "}
          <span className="mono-data">{contractInfo.creditsToken.address}</span>
        </p>
        <p className={isReady ? "has-text-success" : "has-text-warning"}>
          {isReady
            ? "Frontend contract config is ready."
            : "Run the local deployment export script before using the SPA."}
        </p>
      </div>
    </div>
  );
}
