import { http, createConfig, createStorage } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Coinbase Wallet project ID from developer portal (optional, used for analytics)
const projectId = process.env.NEXT_PUBLIC_COINBASE_WALLET_PROJECT_ID;

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "moltcoach",
      preference: "smartWalletOnly",
      ...(projectId ? { appChainIds: [baseSepolia.id] } : {}),
    }),
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
