import { http, createConfig, createStorage } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, walletConnect, injected } from "wagmi/connectors";

// WalletConnect project ID from cloud.walletconnect.com (required for WC)
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// Coinbase Wallet project ID from developer portal (optional, used for analytics)
const cbProjectId = process.env.NEXT_PUBLIC_COINBASE_WALLET_PROJECT_ID;

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "moltcoach",
      preference: "smartWalletOnly",
      ...(cbProjectId ? { appChainIds: [baseSepolia.id] } : {}),
    }),
    ...(wcProjectId
      ? [
          walletConnect({
            projectId: wcProjectId,
            metadata: {
              name: "moltcoach",
              description: "AI coaching agent with on-chain identity",
              url: "https://moltcoach.xyz",
              icons: [],
            },
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: typeof window !== "undefined" ? window.localStorage : undefined }),
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
