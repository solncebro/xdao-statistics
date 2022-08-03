import { GetNetworkDaosInfoParams, getNetworkDaosInfo } from "../common/getNetworkDaosInfo";
import axios from "axios";
import chunk from "lodash/chunk";
import { getProvider, sequenceFetch } from "../utils";
import { Dao__factory } from "../../types/ethers-contracts";
import { constants } from "ethers";
import { CovalentResponse, TokenHolder } from "../../types/covalent";
import { COVALENTHQ_DEFAULT_CHUNK_SIZE, COVALENTHQ_KEYS, COVALENTHQ_RATE_LIMIT } from "../constants";
import { AumStatistic, getAumDaoListStatisticInfo } from "./getAumDaoListStatisticInfo";
import { getNetworkDaosExecutedVoting } from "../common/getNetworkDaosExecutedVoting";

interface GetNetworkDaosStatisticInfoParams extends GetNetworkDaosInfoParams {
  isGetAums: boolean
}

interface DapInfoShort {
  daoName: string;
  dao: string;
  lp: string;
}

export const getNetworkDaosStatisticInfo = async ({
  network,
  daosAddressesList,
  limit,
  isGetAums
}: GetNetworkDaosStatisticInfoParams) => {
  {
    console.log('getNetworkDaosStatisticInfo START')

    const daosRaw = await getNetworkDaosInfo({ network, daosAddressesList, limit });

    const daosShort: DapInfoShort[] = daosRaw.map(({ dao, daoName, lp }) => ({
      dao,
      daoName,
      lp,
    }));

    console.log(`Getting ${daosRaw.length} DAOs executed votings`);







    const executedVotingsAmounts = await getNetworkDaosExecutedVoting({
      network,
      daosAddressesList: daosRaw.map(({dao}) => dao),
      limit
    })

    console.log(`Collected ${executedVotingsAmounts.length} DAO executed voting`);

    const daosIntermediateResult = daosShort.map((dao, index) => ({
      name: dao.daoName,
      address: dao.dao,
      lp: dao.lp,
      executedVotingsLength: executedVotingsAmounts[index],
      gtHolders: "-",
      lpHolders: "-",
      aum: "-",
      link: `https://www.xdao.app/${network.CHAIN_ID}/dao/${dao.dao}`,
    }));








    const gtLpHoldersAddresses = daosShort
      .map((dao) => [dao.dao, dao.lp])
      .flat();
    console.log(`Total GT and LP holdres are ${gtLpHoldersAddresses.length}`);

    const gtLpHoldersAddressesChunked = chunk(gtLpHoldersAddresses, COVALENTHQ_DEFAULT_CHUNK_SIZE);
    console.log(`Total GT and LP holdres splitted to ${gtLpHoldersAddressesChunked.length} chunks by ${COVALENTHQ_DEFAULT_CHUNK_SIZE}`);

    const getHolders = async (requestChunk: string[]) => await Promise.all(
      requestChunk.map(async (address, index) => {
        if (address === constants.AddressZero) {
          return 0;
        }

        const covalentKey = index > 0 ? Math.floor(index / COVALENTHQ_RATE_LIMIT) : 0;

        const { data } = await axios.get<CovalentResponse<TokenHolder>>(
          `https://api.covalenthq.com/v1/${network.CHAIN_ID}/tokens/${address}/token_holders/?key=${COVALENTHQ_KEYS[covalentKey]}`
        );

        return data.data.items.length;
      }))

    console.log("Start getting holders");
    const gtLpHolders = await sequenceFetch(gtLpHoldersAddressesChunked, getHolders)

    console.log("All holders fetched succcessfully");






    let aums: AumStatistic[] = []
    if (isGetAums) {
      aums = await getAumDaoListStatisticInfo({ network, daosAddressesList: daosAddressesList ?? daosIntermediateResult.map(({ address }) => address), limit, hasRequestDaosInfo: false });
    }






    const gtLpHoldersSorted = chunk(gtLpHolders.flat(), 2);

    const daos = daosIntermediateResult.map((dao, index) => ({
      ...dao,
      gtHolders: gtLpHoldersSorted[index][0],
      lpHolders: gtLpHoldersSorted[index][1],
      aum: aums[index]?.aum ?? "-"
    }));

    console.log('getNetworkDaosStatisticInfo FINISH')

    return daos;
  }
};