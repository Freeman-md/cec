export type DiscoverEvent = {
  slug: string;
  title: string;
  category: string;
  venue: string;
  scheduleLabel: string;
  priceLabel: string;
  stateLabel: string;
  ctaLabel: string;
  imageClassName: string;
};

export const discoverCategories = ["All Events", "Music", "Sports", "Workshops", "Arts"] as const;

export const featuredDiscoverEvents: DiscoverEvent[] = [
  {
    slug: "cyber-phonic-nights-genesis",
    title: "Cyber-Phonic Nights: Genesis",
    category: "Music",
    venue: "The Void Main Stage, Campus North",
    scheduleLabel: "Oct 24, 2026 • 8:00 PM",
    priceLabel: "450 CEC",
    stateLabel: "On sale",
    ctaLabel: "Get Ticket",
    imageClassName: "discover-event-card__image--music",
  },
  {
    slug: "neural-network-architecture",
    title: "Neural Network Architecture",
    category: "Workshops",
    venue: "Research Block B, Room 402",
    scheduleLabel: "Oct 29, 2026 • 2:30 PM",
    priceLabel: "Free",
    stateLabel: "Seats open",
    ctaLabel: "Reserve Spot",
    imageClassName: "discover-event-card__image--workshop",
  },
  {
    slug: "midnight-streetball-finals",
    title: "Midnight Streetball Finals",
    category: "Sports",
    venue: "Central Grounds Court",
    scheduleLabel: "Oct 31, 2026 • 6:30 PM",
    priceLabel: "120 CEC",
    stateLabel: "Low availability",
    ctaLabel: "Get Ticket",
    imageClassName: "discover-event-card__image--sports",
  },
];
