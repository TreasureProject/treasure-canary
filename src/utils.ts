import { BigNumberish, Contract } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { formatEther } from "ethers/lib/utils";
import { ChainId } from "@usedapp/core";

import type { Deposit } from "../generated/graphql";
import { Contracts } from "./const";
import { bridgeworld } from "./lib/abis";

const ArbitrumProvider = new StaticJsonRpcProvider(
  "https://arb1.arbitrum.io/rpc"
);

export const generateIpfsLink = (hash: string) => {
  const removedIpfs = hash.substring(7);

  return `https://treasure-marketplace.mypinata.cloud/ipfs/${removedIpfs}`;
};

export const formatNumber = (
  count: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (count >= 1000000) {
    options.minimumFractionDigits = 3;
    options.maximumFractionDigits = 3;
    return `${(count / 1000000).toLocaleString(undefined, options)}M`.replace(
      /[.,]000$/,
      ""
    );
  }

  if (!options.maximumFractionDigits) {
    if (count < 1) {
      options.maximumFractionDigits = 5;
    } else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }
  }

  return count.toLocaleString(undefined, options).replace(/[.,]00$/, "");
};

export const formatPrice = (price: BigNumberish) =>
  formatNumber(parseFloat(formatEther(price)));

export const normalizeDeposit = (deposit: Partial<Deposit>) => {
  const {
    id,
    amount,
    user: { id: address } = {},
    lock,
    endTimestamp = 0,
  } = deposit;
  const parsedAmount = parseFloat(formatEther(amount));
  return {
    id,
    amount: parsedAmount,
    address,
    lock,
    unlockDate: new Date(parseInt(endTimestamp)),
  };
};

export const getLockupPeriodDisplayText = (lock?: number) => {
  switch (lock) {
    case 0:
      return "2 weeks";
    case 1:
      return "1 month";
    case 2:
      return "3 months";
    case 3:
      return "6 months";
    case 4:
      return "12 months";
    default:
      return "Unknown";
  }
};

export const getLockUpPeriodInSeconds = (lock?: number) => {
  switch (lock) {
    case 0:
      return 1209600;
    case 1:
      return 2592000;
    case 2:
      return 7776000;
    case 3:
      return 15552000;
    case 4:
      return 31536000;
    default:
      return 0;
  }
};

export const getLockupPeriodBoost = (lock?: number) => {
  switch (lock) {
    case 0:
      return 0.1;
    case 1:
      return 0.25;
    case 2:
      return 0.8;
    case 3:
      return 1.8;
    case 4:
      return 4;
    default:
      return 0;
  }
};

export const formatDate = (date?: Date) =>
  date?.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const daysUntil = (date1?: Date, date2?: Date): number | undefined => {
  if (!date1 || !date2) {
    return undefined;
  }

  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
};

export const getTotalLpTokens = async (chainId: ChainId) => {
  const contract = new Contract(
    Contracts[chainId].atlasMine,
    bridgeworld,
    ArbitrumProvider
  );
  return contract.totalLpToken();
};
