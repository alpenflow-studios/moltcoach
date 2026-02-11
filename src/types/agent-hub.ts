import type { Address } from "viem";

export type HubAgent = {
  agentId: bigint;
  owner: Address;
  agentURI: string;
  name: string;
  style: string;
  category: string;
  version: string;
};
