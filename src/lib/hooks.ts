import {
  ChainId,
  useContractCall,
  useEthers,
} from "@usedapp/core";
import { utils } from "ethers";

import { Contracts } from "../const";
import { bridgeworld } from "./abis";

const BridgeworldInterface = new utils.Interface(bridgeworld);

export function useChainId() {
  const { chainId } = useEthers();

  switch (chainId) {
    case ChainId.Arbitrum:
    case ChainId.Rinkeby:
      return chainId;
    default:
      return ChainId.Arbitrum;
  }
}

export function useBridgeworld() {
  const chainId = useChainId();
  const contractAddress = Contracts[chainId].atlasMine;

  const [accMagicPerShare = 0] = useContractCall({
    abi: BridgeworldInterface,
    address: contractAddress,
    method: "accMagicPerShare",
    args: [],
  }) || [];

  const [totalLpToken = 0] = useContractCall({
    abi: BridgeworldInterface,
    address: contractAddress,
    method: "totalLpToken",
    args: [],
  }) || [];

  return {
    accMagicPerShare,
    totalLpToken,
  };
}
