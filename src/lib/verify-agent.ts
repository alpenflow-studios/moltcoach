import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { nonceStore } from "./nonce-store";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

type VerifierClient = {
  verifyRequest: (request: Request) => Promise<VerifyResultOk | VerifyResultFail>;
};

type VerifyResultOk = {
  ok: true;
  address: `0x${string}`;
  chainId: number;
  label: string;
  components: string[];
  replayable: boolean;
  binding: "request-bound" | "class-bound";
};

type VerifyResultFail = {
  ok: false;
  reason: string;
  detail?: string;
};

let verifier: VerifierClient | null = null;
let initAttempted = false;

async function initVerifier(): Promise<VerifierClient | null> {
  if (initAttempted) return verifier;
  initAttempted = true;

  try {
    const { createVerifierClient } = await import("@slicekit/erc8128");

    verifier = createVerifierClient(
      publicClient.verifyMessage.bind(publicClient),
      nonceStore,
      {
        maxValiditySec: 300,
        clockSkewSec: 5,
        label: "clawcoach",
        strictLabel: false,
        replayable: false,
      },
    ) as VerifierClient;
  } catch (err) {
    console.warn("[verify-agent] Failed to initialize ERC-8128 verifier:", err);
    verifier = null;
  }

  return verifier;
}

export { initVerifier };
export type { VerifyResultOk, VerifyResultFail };
