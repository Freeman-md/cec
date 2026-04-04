export const demoEvents = {
  "campus-beats-2024": {
    eventId: 1,
    title: "Campus Beats 2024",
    eyebrow: "On sale",
    category: "Electronic / Future Bass",
    dateLabel: "Oct 24, 2024",
    timeLabel: "20:00 - 02:00",
    venue: "Neo-Tokyo Arena",
    organizerName: "CyberPulse Media",
    organizerSummary: "Student-led digital event collective focused on immersive campus nightlife experiences.",
    summary: "Campus Beats 2024 combines digital curation, verified ticket ownership, and controlled on-chain access.",
    tierLabels: {
      1: "General Admission",
      2: "VIP Obsidian Pass",
    },
    benefits: [
      "Verified on-chain ticket ownership",
      "Per-wallet cap enforcement",
      "Non-transferable NFT ticketing",
    ],
  },
} as const;

export type DemoEventSlug = keyof typeof demoEvents;
export type DemoEventContent = (typeof demoEvents)[DemoEventSlug];

function buildFallbackEvent(eventId: number) {
  return {
    eventId,
    title: `Campus Event #${eventId}`,
    eyebrow: "Live event",
    category: "Campus Experience",
    dateLabel: "Date to be confirmed",
    timeLabel: "Time to be confirmed",
    venue: "Venue to be confirmed",
    organizerName: "Approved organizer",
    organizerSummary: "Organizer-managed on-chain event created through the studio.",
    summary: `This organizer-created event is now visible from the live event directory and can be configured on-chain.`,
    tierLabels: {} as Record<number, string>,
    benefits: [
      "Organizer-managed ticket configuration",
      "Per-wallet cap support",
      "On-chain ticket ownership",
    ],
  };
}

export function getEventRouteKey(eventId: number) {
  const matchedEntry = Object.entries(demoEvents).find(([, eventContent]) => eventContent.eventId === eventId);
  return matchedEntry ? matchedEntry[0] : `event-${eventId}`;
}

export function getEventIdFromRouteKey(routeKey: string) {
  const matchedEntry = Object.entries(demoEvents).find(([slug]) => slug === routeKey);
  if (matchedEntry) {
    return matchedEntry[1].eventId;
  }

  const genericMatch = routeKey.match(/^event-(\d+)$/);
  return genericMatch ? Number(genericMatch[1]) : null;
}

export function getEventContentByEventId(eventId: number) {
  const matchedEntry = Object.values(demoEvents).find((eventContent) => eventContent.eventId === eventId);
  return matchedEntry ?? buildFallbackEvent(eventId);
}

export function getEventContentByRouteKey(routeKey: string) {
  const matchedEntry = demoEvents[routeKey as DemoEventSlug];
  if (matchedEntry) {
    return matchedEntry;
  }

  const eventId = getEventIdFromRouteKey(routeKey);
  return buildFallbackEvent(eventId ?? 0);
}
