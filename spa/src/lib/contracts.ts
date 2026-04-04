import { Contract, formatUnits, type BrowserProvider, type ContractRunner, type InterfaceAbi } from "ethers";
import contractInfo from "../config/contract-info.json";
import type { AppRole } from "../types/app";

type ContractConfig = {
  address: string;
  abi: InterfaceAbi;
};

type ContractInfo = typeof contractInfo & {
  creditsToken: ContractConfig;
  eventPlatform: ContractConfig;
  ticketNFT?: ContractConfig;
  demoData?: {
    organizerAddress: string;
    featuredEventId: number;
    featuredEventSlug: string;
    tierIds: number[];
  };
};

const appContracts = contractInfo as ContractInfo;

function getContract(config: ContractConfig, runner: ContractRunner) {
  return new Contract(config.address, config.abi, runner);
}

export function getAppContracts(runner: ContractRunner) {
  return {
    creditsToken: getContract(appContracts.creditsToken, runner),
    eventPlatform: getContract(appContracts.eventPlatform, runner),
    ticketNFT: appContracts.ticketNFT ? getContract(appContracts.ticketNFT, runner) : null,
  };
}

export function getExpectedChainId() {
  return Number(appContracts.chainId);
}

export function getExpectedChainLabel() {
  return `${appContracts.networkName} · ${appContracts.chainId}`;
}

export function getDemoData() {
  return (
    appContracts.demoData ?? {
      organizerAddress: "0x0000000000000000000000000000000000000000",
      featuredEventId: 1,
      featuredEventSlug: "campus-beats-2024",
      tierIds: [1, 2],
    }
  );
}

export async function detectRole(provider: BrowserProvider, account: string): Promise<AppRole> {
  const { eventPlatform } = getAppContracts(provider);

  try {
    const admin = String(await eventPlatform.admin()).toLowerCase();
    if (admin === account.toLowerCase()) {
      return "admin";
    }

    const approvedOrganizer = Boolean(await eventPlatform.approvedOrganizers(account));
    return approvedOrganizer ? "organizer" : "student";
  } catch {
    return "student";
  }
}

export async function readCreditsBalance(provider: BrowserProvider, account: string) {
  const { creditsToken } = getAppContracts(provider);

  try {
    const balance = await creditsToken.balanceOf(account);
    return formatUnits(balance, 18);
  } catch {
    return "0";
  }
}

export async function readExchangeRate(provider: BrowserProvider) {
  const { eventPlatform } = getAppContracts(provider);

  try {
    return BigInt(await eventPlatform.ethToCreditsRate());
  } catch {
    return 0n;
  }
}

export async function readCreditsAllowance(provider: BrowserProvider, owner: string) {
  const { creditsToken, eventPlatform } = getAppContracts(provider);

  try {
    const allowance = await creditsToken.allowance(owner, await eventPlatform.getAddress());
    return allowance as bigint;
  } catch {
    return 0n;
  }
}

export async function readEventSnapshot(provider: BrowserProvider, eventId: number, tierIds: number[]) {
  const { eventPlatform } = getAppContracts(provider);

  try {
    const [eventData, tiers] = await Promise.all([
      eventPlatform.events(eventId),
      Promise.all(tierIds.map((tierId) => eventPlatform.ticketTiers(eventId, tierId))),
    ]);

    return {
      eventState: Number(eventData.state),
      walletCap: Number(eventData.walletCap),
      tiers: tiers.map((tier, index) => ({
        tierId: tierIds[index],
        label: String(tier.label),
        priceInCredits: tier.priceInCredits as bigint,
        maxSupply: Number(tier.maxSupply),
        soldCount: Number(tier.soldCount),
      })),
    };
  } catch {
    return {
      eventState: 0,
      walletCap: 0,
      tiers: tierIds.map((tierId) => ({
        tierId,
        label: "Unavailable",
        priceInCredits: 0n,
        maxSupply: 0,
        soldCount: 0,
      })),
    };
  }
}

export async function readWalletPurchases(provider: BrowserProvider, eventId: number, account: string) {
  const { eventPlatform } = getAppContracts(provider);

  try {
    return Number(await eventPlatform.walletPurchases(eventId, account));
  } catch {
    return 0;
  }
}

export async function readOwnedTickets(provider: BrowserProvider, account: string) {
  const { ticketNFT } = getAppContracts(provider);

  if (!ticketNFT) {
    return [];
  }

  try {
    const nextTicketId = Number(await ticketNFT.nextTicketId());
    const ownedTickets: Array<{
      ticketId: number;
      eventId: number;
      tierId: number;
      state: number;
    }> = [];

    for (let ticketId = 1; ticketId < nextTicketId; ticketId += 1) {
      try {
        const owner = String(await ticketNFT.ownerOf(ticketId)).toLowerCase();
        if (owner !== account.toLowerCase()) {
          continue;
        }

        const [eventId, tierId, state] = await Promise.all([
          ticketNFT.ticketEventIds(ticketId),
          ticketNFT.ticketTierIds(ticketId),
          ticketNFT.ticketStates(ticketId),
        ]);

        ownedTickets.push({
          ticketId,
          eventId: Number(eventId),
          tierId: Number(tierId),
          state: Number(state),
        });
      } catch {
        continue;
      }
    }

    return ownedTickets;
  } catch {
    return [];
  }
}

export async function readOrganizerEvents(provider: BrowserProvider, organizer: string) {
  const { eventPlatform } = getAppContracts(provider);

  try {
    const nextEventId = Number(await eventPlatform.nextEventId());
    const ownedEvents: Array<{
      eventId: number;
      state: number;
      walletCap: number;
      nextTierId: number;
    }> = [];

    for (let eventId = 1; eventId < nextEventId; eventId += 1) {
      try {
        const [eventData, nextTierId] = await Promise.all([
          eventPlatform.events(eventId),
          eventPlatform.nextTierIdByEvent(eventId),
        ]);

        if (String(eventData.organizer).toLowerCase() !== organizer.toLowerCase()) {
          continue;
        }

        ownedEvents.push({
          eventId,
          state: Number(eventData.state),
          walletCap: Number(eventData.walletCap),
          nextTierId: Number(nextTierId),
        });
      } catch {
        continue;
      }
    }

    return ownedEvents;
  } catch {
    return [];
  }
}
