import { BigNumber } from "ethers";

export type DaoInfoStructOutput = [
  string,
  string,
  string,
  string,
  string,
  string
] & {
  dao: string;
  daoName: string;
  daoSymbol: string;
  lp: string;
  lpName: string;
  lpSymbol: string;
};

export type ExecutedVotingStructOutput = [
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  string,
  string[]
] & {
  target: string;
  data: string;
  value: BigNumber;
  nonce: BigNumber;
  timestamp: BigNumber;
  executionTimestamp: BigNumber;
  txHash: string;
  sigs: string[];
};