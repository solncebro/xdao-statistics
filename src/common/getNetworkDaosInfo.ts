import { NetworkStateConfig } from "../../types/common";
import { DaoInfoStructOutput } from "../../types/dao";
import { AdvancedViewer__factory, DaoViewer__factory, Factory__factory } from "../../types/ethers-contracts";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { sleep } from "../utils";

export interface GetNetworkDaosInfoParams {
  network: NetworkStateConfig,
  daosAddressesList?: string[],
  limit?: number
  chunkSize?: number
}

export const getNetworkDaosInfo = async ({
  network,
  daosAddressesList,
  limit
}: GetNetworkDaosInfoParams): Promise<DaoInfoStructOutput[]> => {
  const advancedViewerAddress = network.ADVANCED_VIEWER_ADDRESS;

  if (advancedViewerAddress) {
    const numberOfDaos = daosAddressesList
      ? daosAddressesList.length
      : (
        await Factory__factory.connect(
          network.FACTORY_ADDRESS,
          new StaticJsonRpcProvider(network.RPC_HOST)
        ).numberOfDaos()
      ).toNumber();

    const daoLimit =
      limit && limit < numberOfDaos ? limit : numberOfDaos;
    const defaultChunkSize = 300;
    const chunkSize = daoLimit > defaultChunkSize ? defaultChunkSize : daoLimit
    const numberOfChunks =
      Math.floor(daoLimit / chunkSize) + (daoLimit % chunkSize > 0 ? 1 : 0);

    let daosInfo: DaoInfoStructOutput[] = [];

    const advancedViewer = await AdvancedViewer__factory.connect(
      advancedViewerAddress,
      new StaticJsonRpcProvider(network.RPC_HOST));

    for (let chunk = 0; chunk < numberOfChunks; ++chunk) {
      const start = chunk * chunkSize;
      const end = Math.min((chunk + 1) * chunkSize, daoLimit);
      console.log({ chunk, start, end, numberOfChunks });

      const daoAddressesListForRequest =
        daosAddressesList ??
        (await advancedViewer.getDaos(start, end));

      const daosInfoChunk: DaoInfoStructOutput[] = await advancedViewer.getDaosInfo(daoAddressesListForRequest)

      console.log(
        `Loaded ${Math.min(
          (chunk + 1) * chunkSize,
          numberOfDaos
        )}/${daoLimit} DAOs`
      );

      daosInfo = [...daosInfo, ...daosInfoChunk];

      await sleep(3000);
    }

    return daosInfo;
  } else {
    return await DaoViewer__factory.connect(
      network.DAOVIEWER_ADDRESS,
      new StaticJsonRpcProvider(network.RPC_HOST)
    ).getDaos(network.FACTORY_ADDRESS);
  }
};
