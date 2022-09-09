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

export const legionNfts = [
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x10a",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Common%20Assassin.gif",
    metadata: {
      boost: "0.5",
    },
    name: "Genesis Common",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x100",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Special%20Numeraire.gif",
    metadata: {
      boost: "0.75",
    },
    name: "Genesis Special",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x105",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Uncommon%20Siege.gif",
    metadata: {
      boost: "1.0",
    },
    name: "Genesis Uncommon",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x104",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Rare%20All-Class.gif",
    metadata: {
      boost: "2.0",
    },
    name: "Genesis Rare",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x20b",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Legendary%20Origin.gif",
    metadata: {
      boost: "6.0",
    },
    name: "Bombmaker",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x65d",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Legendary%20Origin.gif",
    metadata: {
      boost: "6.0",
    },
    name: "Warlock",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x6d0",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Legendary%20Origin.gif",
    metadata: {
      boost: "6.0",
    },
    name: "Fallen",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x8bf",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Legendary%20Origin.gif",
    metadata: {
      boost: "6.0",
    },
    name: "Dreamwinder",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0xd94",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Legendary%20Origin.gif",
    metadata: {
      boost: "6.0",
    },
    name: "Clocksnatcher",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x1",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Common%20Assassin.gif",
    metadata: {
      boost: "0.05",
    },
    name: "Auxiliary Common",
  },
  {
    id: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0x101",
    category: "Legion",
    image:
      "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC/Uncommon%20Assassin.gif",
    metadata: {
      boost: "0.1",
    },
    name: "Auxiliary Uncommon",
  },
];
