export const demoEvents = {
  "campus-beats-2024": {
    title: "Campus Beats 2024",
    eyebrow: "On sale",
    category: "Electronic / Future Bass",
    dateLabel: "Oct 24, 2024",
    timeLabel: "20:00 - 02:00",
    venue: "Neo-Tokyo Arena",
    organizerName: "CyberPulse Media",
    organizerSummary: "Student-led digital event collective focused on immersive campus nightlife experiences.",
    summary:
      "Campus Beats 2024 is the seeded local demo event for the CW2 SPA. It is used to prove credit purchase, ticket approval, and NFT ticket acquisition through one simple student flow.",
    benefits: [
      "Verified on-chain ticket ownership",
      "Per-wallet cap enforcement",
      "Non-transferable NFT ticketing",
    ],
  },
} as const;

export type DemoEventSlug = keyof typeof demoEvents;
