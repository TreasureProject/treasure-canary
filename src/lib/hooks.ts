import {
  ChainId,
  useEthers,
} from "@usedapp/core";

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
