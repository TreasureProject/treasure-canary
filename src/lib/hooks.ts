import { useState } from "react";
import { ChainId, useEthers } from "@usedapp/core";
import { Contract } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

import { Contracts } from "../const";
import { bridgeworld } from "./abis";

const ArbitrumProvider = new StaticJsonRpcProvider("https://arb1.arbitrum.io/rpc");

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
  const [data, setData] = useState<{ totalLpToken?: number }>({});
  const chainId = useChainId();

  const contract = new Contract(Contracts[chainId].atlasMine, bridgeworld, ArbitrumProvider);
  contract.totalLpToken().then((totalLpToken) => {
    setData({ totalLpToken });
  });

  return data;
}
