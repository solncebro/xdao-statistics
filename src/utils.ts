import fs from "fs";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkStateConfig } from "../types/common";

import { NETWORKS } from "./constants";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getNetworkByByChainId = (chainId: number) => NETWORKS.find((item) => item.CHAIN_ID === chainId);

export const getProvider = (network: NetworkStateConfig) => new StaticJsonRpcProvider(network.RPC_HOST);

interface SaveToCsvParams { list: Array<Object>, network: NetworkStateConfig, limit?: string, reportType: string, daosAddressesList?: string[] }

export const saveToCsv = ({ list, network, limit, reportType, daosAddressesList }: SaveToCsvParams) => {
  const header = Object.keys(list[0]).join(",");
  const daosCsvFormat = [header, ...list.map(dao => Object.values(dao).join(","))].join("\r\n")

  fs.writeFileSync(`reports/${reportType}_${network.CHAIN_ID}${limit ? `_limit_${limit}` : ""}${daosAddressesList ? `_user_list_${daosAddressesList.length}` : ""}.csv`, daosCsvFormat)
}

export const sequenceFetch = async <T, U>(source: T[][], chunkHandler: (requestChunk: T[]) => Promise<U[]>, sleepSeconds?: number): Promise<U[][]> => {
  let fetchedChunk = 0;
  const result: U[][] = []

  for (const requestChunk of source) {
    result[fetchedChunk] = await retryRequest(() => chunkHandler(requestChunk))

    fetchedChunk++
    console.log(`Fetched ${fetchedChunk}/${source.length} chunks`);

    if (sleepSeconds) {
      await sleep(sleepSeconds * 1000)
    }
  }

  return result;
}

export const retryRequest = async (executablePromise: () => Promise<any>): Promise<any> => {
  try {
    return await executablePromise()
  } catch {
    console.log("Request Failed")
    return await retryRequest(executablePromise)
  }
}