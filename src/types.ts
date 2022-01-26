import { TokenStandard } from "../generated/graphql";

export type Nft = {
  address: string;
  collection: string;
  listing?: {
    expires: string;
    pricePerItem: string;
    quantity: number;
  };
  name: string;
  total: number;
  standard: TokenStandard;
  source: string;
  tokenId: string;
};
