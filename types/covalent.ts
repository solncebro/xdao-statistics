export type CovalentParams = {
  address: string;
  chainId: number | string;
  pageSize?: number;
};

export interface CovalentPagination {
  has_more: null;
  page_number: number;
  page_size: number;
  total_count: null;
}

export interface TokenHolder {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: null;
  logo_url: string;
  address: string;
  balance: string;
  total_supply: string;
  block_height: number;
}

export interface CovalentData<T> {
  chain_id: number;
  updated_at: string;
  items: T[];
  pagination: CovalentPagination;
}

export interface Transaction {
  block_signed_at: Date;
  block_height: number;
  tx_hash: string;
  fees_paid: string;
}
export interface CovalentResponse<T> {
  data: CovalentData<T>;
  error: boolean;
  error_message: string;
  error_code: number;
}

export interface CovalentTokenInfo {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: string[];
  logo_url: string;
  last_transferred_at: string;
  type: string;
  balance: string;
  balance_24h: string;
  quote_rate: number;
  quote_rate_24h: number;
  quote: number;
  quote_24h: number;
  nft_data: null;
}

export interface CovalenthqUserChainBalance {
  data: {
    items: {
      quote: number;
      type: string;
      contract_address: string;
    }[];
  };
}