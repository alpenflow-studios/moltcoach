import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

// Privy manages all wallet connectors (Coinbase, MetaMask, WalletConnect, etc.)
// We only need to define chains and transports here.
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
