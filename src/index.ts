import { getAumDaoListStatisticInfo } from "./scripts/getAumDaoListStatisticInfo";
import { getNetworkDaosStatisticInfo } from "./scripts/getNetworkDaosStatisticInfo";
import { getNetworkByByChainId, saveToCsv } from "./utils";

export enum ReportTypes {
  daosDetails = "daosDetails",
  daosAums = 'daosAums'
}

const daosAddressesList = undefined
// const daosAddressesList = [
//   "0xDF0225A07D5Fdace440cbB3E70e87f511E18e6F4",
//   "0xA8c39D39Df7069198A1CE0467752e1778DC812cC",
//   "0xf8A2b0F0731858dC21f8BEb1B512792276734669",
//   "0x764f8a3ACb567287cEde5d5425513716D54A0169",
//   "0xcc07D1C0C3D2DA9749e87eFA22DcD44CC132A1DA",
//   "0x681c4b86E24a95626C3B235f9B207b15b7655344",
//   "0x0606ED3E5c46F97394E6bE678Fd83B9aB3D7c65A",
// ];

const main = async () => {
  const [,, chainId, reportType, limit, propA] = process.argv;

  const network = getNetworkByByChainId(+chainId)
  const optionA = !propA

  if (!network) {
    return console.log('Network Undefined');
  }

  if (!reportType) {
    return console.log('Report type Undefined');
  }

  console.log(`${reportType} statistics for ${network.NAME} chain${limit ? ` LIMIT ${limit}` : ""}${daosAddressesList ? ` with user's list` : ""}`);

  let result: any[] = []

  if (reportType === ReportTypes.daosDetails) {
    result = await getNetworkDaosStatisticInfo({network, daosAddressesList, limit: +limit, isGetAums: optionA});
  }

  if (reportType === ReportTypes.daosAums) {
    result = await getAumDaoListStatisticInfo({network, daosAddressesList, limit: +limit, hasRequestDaosInfo: optionA});
  }

  saveToCsv({list: result, network, limit, reportType});
}

main();