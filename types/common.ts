export interface NetworkStateConfig {
  NAME: string;
  RPC_HOST: string;
  CHAIN_ID: number;
  SHOP_ADDRESS: string;
  XDAO_ADDRESS: string;
  FACTORY_ADDRESS: string;
  DAOVIEWER_ADDRESS: string;
  ADVANCED_VIEWER_ADDRESS?: string;
  COIN: string;
  LOGO: string;
  EXPLORER_NAME: string;
  EXPLORER_ADDRESS: string;
  EXPLORER_ADDRESS_PREFIX?: string;
  EXPLORER_LOGO: string;
  WRAPPED_COIN_ADDRESS: string;
  DEBANK_CHAIN_ID: string;
  ZAPPER_CHAIN_ID: string;
  APEBOARD_CHAIN_ID: string;
  SHIT_TOKENS_LIST?: string[]
}
