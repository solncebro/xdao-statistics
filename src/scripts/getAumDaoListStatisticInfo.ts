import axios from "axios";
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { CovalenthqUserChainBalance } from "../../types/covalent";
import { DaoInfoStructOutput } from "../../types/dao";
import { DeBankUserChainBalance } from "../../types/debank";
import { FirestoreDaoHiddenTokensResponse } from "../../types/firestore";
import { getNetworkDaosInfo, GetNetworkDaosInfoParams } from "../common/getNetworkDaosInfo";
import { COVALENTHQ_DEFAULT_CHUNK_SIZE, COVALENTHQ_KEYS, COVALENTHQ_RATE_LIMIT, COVALENT_SUPPORTED_CHAIN_IDS, DEBANK_RATE_LIMIT } from "../constants";
import { sequenceFetch } from "../utils";

interface GetAumDaoListStatisticInfo extends GetNetworkDaosInfoParams {
  hasRequestDaosInfo: boolean
}

export interface AumStatistic {
  address: string;
  name: string;
  aum: number
}

export const getAumDaoListStatisticInfo = async ({
  network,
  daosAddressesList,
  limit,
  hasRequestDaosInfo
}: GetAumDaoListStatisticInfo) => {
  console.log('getAumDaoListStatisticInfo START')

  const isDebankForRequest = false;
  let daosInfo: DaoInfoStructOutput[] = []

  const isNeedRequestDaosInfo = !daosAddressesList || (hasRequestDaosInfo && !!daosAddressesList)

  if (isNeedRequestDaosInfo) {
    daosInfo = await getNetworkDaosInfo({ network, daosAddressesList, limit });
  }

  const daoAddressesListForRequest = daosAddressesList ? daosAddressesList : daosInfo.map(({dao}) => dao);

  console.log("Getting HIDDEN tokens info")
  let hiddenTokens: string[] = [];
  try {
    const firestoreHiddenTokensList = await Promise.all(
      daoAddressesListForRequest.map((address) =>
        axios.get<FirestoreDaoHiddenTokensResponse>(
          `https://firestore.googleapis.com/v1/projects/xdao-app/databases/(default)/documents/networks/${network.CHAIN_ID
          }/dao/${address.toLowerCase()}`
        )
      )
    );

    hiddenTokens = flatMap(
      firestoreHiddenTokensList.map(({ data }) =>
        data.fields.hiddenTokens.arrayValue.values.map((value) =>
          value.stringValue.toLowerCase()
        )
      )
    );
  } catch {
    hiddenTokens = [];
  }

  let covalentAums: number[] = [];
  let debankAums: number[] = [];

  if (COVALENT_SUPPORTED_CHAIN_IDS.includes(network.CHAIN_ID)) {
    console.log("Getting AUMs from Covalent")

    const daoAddressesListForRequestChunked = chunk(daoAddressesListForRequest, COVALENTHQ_DEFAULT_CHUNK_SIZE);
    console.log(`Total DAOs splitted to ${daoAddressesListForRequestChunked.length} chunks by ${COVALENTHQ_DEFAULT_CHUNK_SIZE}`);

    const getAumCovalent = async (requestChunk: string[]) => await Promise.all(
      requestChunk.map(async (address, index) => {
        const covalentKey = index > 0 ? Math.floor(index / COVALENTHQ_RATE_LIMIT) : 0;

        const { data } = await axios.get<CovalenthqUserChainBalance>(
          `https://api.covalenthq.com/v1/${network.CHAIN_ID}/address/${address}/balances_v2/?key=${COVALENTHQ_KEYS[covalentKey]}`
        )

        const daoAums = data.data.items.map(({ quote, type, contract_address }) => {
          if (type === "dust") {
            return 0;
          }
          if (hiddenTokens.includes(contract_address.toLowerCase()) || network.SHIT_TOKENS_LIST?.includes(contract_address.toLowerCase())) {
            return 0;
          }
          return quote;
        })

        const aumsSummary = daoAums.reduce((acc, item) => acc + item, 0);

        return aumsSummary
      })
    )

    const covalentAumsRaw = (await sequenceFetch(daoAddressesListForRequestChunked, getAumCovalent));

    covalentAums = covalentAumsRaw.flat()

    console.log(`AUMs from Covalent: ${covalentAums.length}`)
  }

  if (network.DEBANK_CHAIN_ID !== "" && isDebankForRequest) {
    console.log("Getting AUMs from DeBank")

    const daoAddressesListForRequestChunked = chunk(daoAddressesListForRequest, DEBANK_RATE_LIMIT);
    console.log(`Total DAOs splitted to ${daoAddressesListForRequestChunked.length} chunks by ${DEBANK_RATE_LIMIT}`);


    const getAumDebank = async (requestChunk: string[]) => await Promise.all(
      requestChunk.map(async (address) => {
        const { data } = await axios.get<DeBankUserChainBalance>(
          `https://openapi.debank.com/v1/user/chain_balance?id=${address}&chain_id=${network.DEBANK_CHAIN_ID}`
        )

        return data.usd_value;
      })
    )

    debankAums = (await sequenceFetch(daoAddressesListForRequestChunked, getAumDebank)).flat();

    console.log(`AUMs from DeBank: ${debankAums.length}`)
  }

  const aums = daoAddressesListForRequest.map((dao, index) => ({ address: !isNeedRequestDaosInfo ? dao : daosInfo[index].dao, name: !isNeedRequestDaosInfo ? "-" : daosInfo[index].daoName,  aum: Math.max(covalentAums[index], debankAums[index] ?? 0) }));

  console.log('getAumDaoListStatisticInfo FINISH')

  return aums;
}