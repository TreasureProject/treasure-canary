import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.Rinkeby]: {
    magic: "0xFd25767f710966F8a557b236a3CaeF8F92Eb7C10",
    atlasMine: "0x34919698cd91aaf30a3ce5b2ff4ee5ccb59fdc88",
    bridgeworld: "0xc71e6725569af73ac6641ec4bcc99a709ead40c7",
  },
  [ChainId.Arbitrum]: {
    magic: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    atlasMine: "0xa0a89db1c899c49f98e6326b764bafcf167fc2ce",
    bridgeworld: "0xc71e6725569af73ac6641ec4bcc99a709ead40c7",
  },
};

export const TOTAL_EMISSIONS = 23464251;

export const EMISSIONS_PER_HOUR = TOTAL_EMISSIONS / 5844; // 8 months
