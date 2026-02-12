import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import type { RouteConfig } from "@x402/next";

/**
 * x402 server configuration for pay-per-coach endpoints.
 *
 * Revenue flows to the ProtocolFeeCollector contract on Base Sepolia.
 * In production, switch facilitator URL and network to Base mainnet.
 */

const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://www.x402.org/facilitator";

/** Payment receiving address — ProtocolFeeCollector on Base Sepolia */
const PAY_TO =
  (process.env.X402_PAY_TO as `0x${string}`) ??
  "0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55";

/** Base Sepolia = eip155:84532, Base mainnet = eip155:8453 */
const NETWORK = (process.env.X402_NETWORK ?? "eip155:84532") as `${string}:${string}`;

/** Price per coaching interaction in USD (USDC) */
const CHAT_PRICE = process.env.X402_CHAT_PRICE ?? "$0.01";

/** Number of free messages before x402 kicks in */
export const FREE_MESSAGE_LIMIT = Number(
  process.env.X402_FREE_MESSAGE_LIMIT ?? "10",
);

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

export const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);

export const chatPaymentConfig: RouteConfig = {
  accepts: [
    {
      scheme: "exact",
      price: CHAT_PRICE,
      network: NETWORK,
      payTo: PAY_TO,
    },
  ],
  description: "ClawCoach AI coaching interaction",
  mimeType: "text/plain",
};
