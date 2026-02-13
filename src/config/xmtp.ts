/** XMTP network environment — 'dev' for testnet, 'production' for mainnet */
export const XMTP_ENV = "dev" as const;

/**
 * The ClawCoach agent's XMTP address.
 * MVP: User's browser opens a conversation with this address and writes
 * both user + AI messages for persistence.
 * Phase 2: Server-side agent reads/responds from this address.
 */
export const CLAWCOACH_AGENT_XMTP_ADDRESS = (
  process.env.NEXT_PUBLIC_CLAWCOACH_AGENT_XMTP_ADDRESS?.trim() ?? ""
) as `0x${string}`;

/** Prefix used to mark AI responses sent from the user's XMTP client */
export const ASSISTANT_MSG_PREFIX = "[assistant] ";
