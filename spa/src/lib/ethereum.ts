import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

export function getInjectedProvider() {
  return typeof window !== "undefined" ? window.ethereum : undefined;
}

export function createBrowserProvider() {
  const ethereum = getInjectedProvider();
  return ethereum ? new BrowserProvider(ethereum) : null;
}
