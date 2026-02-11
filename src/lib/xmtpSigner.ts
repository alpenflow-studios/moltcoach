import type { WalletClient } from "viem";
import { toBytes } from "viem";

/**
 * XMTP V3 Signer interface (structural type matching @xmtp/browser-sdk Signer).
 * Defined here to avoid a top-level runtime import of the browser SDK.
 */
export type XmtpSigner = {
  type: "EOA";
  getIdentifier: () => { identifier: string; identifierKind: number };
  signMessage: (message: string) => Promise<Uint8Array>;
};

/** IdentifierKind.Ethereum from @xmtp/browser-sdk (value = 0) */
const IDENTIFIER_KIND_ETHEREUM = 0;

/**
 * Wraps a viem WalletClient as an XMTP V3 compatible signer.
 * V3 changes from V2:
 * - getAddress() → getIdentifier() returning { identifier, identifierKind }
 * - signMessage returns Uint8Array (bytes) instead of hex string
 * - type: "EOA" required
 */
export function walletClientToXmtpSigner(walletClient: WalletClient): XmtpSigner {
  const account = walletClient.account;
  if (!account) {
    throw new Error("WalletClient has no account connected");
  }

  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: account.address.toLowerCase(),
      identifierKind: IDENTIFIER_KIND_ETHEREUM,
    }),
    signMessage: async (message: string): Promise<Uint8Array> => {
      const signature = await walletClient.signMessage({ account, message });
      return toBytes(signature);
    },
  };
}
