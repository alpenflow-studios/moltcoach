import { http, createConfig, createStorage } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "moltcoach",
      preference: "smartWalletOnly",
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
