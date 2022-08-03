export interface FirestoreDaoHiddenTokensResponse {
  fields: {
    hiddenTokens: {
      arrayValue: {
        values: {
          stringValue: string;
        }[];
      };
    };
  };
}