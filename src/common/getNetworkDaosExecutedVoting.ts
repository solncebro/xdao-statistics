import { AdvancedViewer__factory, Dao__factory } from "../../types/ethers-contracts";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getProvider, sequenceFetch } from "../utils";
import chunk from "lodash/chunk";
import { GetNetworkDaosInfoParams } from "./getNetworkDaosInfo";

export const getNetworkDaosExecutedVoting = async ({
  network,
  daosAddressesList,
}: GetNetworkDaosInfoParams): Promise<number[]> => {
  const advancedViewerAddress = network.ADVANCED_VIEWER_ADDRESS;
  const daosShortChunked = chunk(daosAddressesList, 100);

  if (advancedViewerAddress) {
    const advancedViewer = await AdvancedViewer__factory.connect(
      advancedViewerAddress,
      new StaticJsonRpcProvider(network.RPC_HOST));

      const getExecutedVotingsGroupChunk = async (requestChunk: string[]) => await advancedViewer.getDaosExecutedVoting(requestChunk)

      const executedVotingsChunked = await sequenceFetch(daosShortChunked, getExecutedVotingsGroupChunk);

      return executedVotingsChunked.flat().map(item => item.toNumber());
  } else {
    const getExecutedVotingsOneByOneChunk = async (requestChunk: string[]) => await Promise.all(
      requestChunk.map((dao) =>
        Dao__factory.connect(dao, getProvider(network)).getExecutedVoting()
      )
    )

    const executedVotingsChunked = await sequenceFetch(daosShortChunked, getExecutedVotingsOneByOneChunk);

    return executedVotingsChunked.flat().map(item => item.length);
  }
};
