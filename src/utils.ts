import { formatEther } from "ethers/lib/utils";
import { BigNumberish } from "ethers";
import type { Deposit } from "../generated/graphql";

const UNITS = ["", "K", "M", "B", "T", "Q"];

export const generateIpfsLink = (hash: string) => {
  const removedIpfs = hash.substring(7);

  return `https://treasure-marketplace.mypinata.cloud/ipfs/${removedIpfs}`;
};

export const formatNumber = (count: number, options: Intl.NumberFormatOptions = {}): string => {
  if (count >= 1000000) {
    options.minimumFractionDigits = 3;
    options.maximumFractionDigits = 3;
    return `${(count / 1000000).toLocaleString(undefined, options)}M`.replace(/[.,]000$/, "");
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

// takes a Collection Name and tries to return a user-friendly slug for routes
// can return undefined if chainId is missing, or address lookup fails
export function getCollectionSlugFromName(
  collectionName: string | null | undefined
): string | undefined {
  return collectionName?.replace(/\s+/g, "-")?.toLowerCase();
}

export const normalizeDeposit = (deposit: Partial<Deposit>, boostPct = 0) => {
  const {
    id,
    amount,
    user: { id: address } = {},
    lock,
    endTimestamp = 0,
  } = deposit;
  const amountWei = parseFloat(formatEther(amount));
  return {
    id,
    amount: amountWei,
    address,
    lock,
    unlockDate: new Date(parseInt(endTimestamp)),
    miningPower: amountWei + (getLockupPeriodBoost(lock) * amountWei) + (amountWei * boostPct),
  };
};

export const getLockupPeriodDisplayText = (lock?: number) => {
  switch (lock) {
    case 0: return '2 weeks';
    case 1: return '1 month';
    case 2: return '3 months';
    case 3: return '6 months';
    case 4: return '12 months';
    default: return 'Unknown';
  }
}

export const getLockupPeriodBoost = (lock?: number) => {
  switch (lock) {
    case 0: return 0.1;
    case 1: return 0.25;
    case 2: return 0.8;
    case 3: return 1.8;
    case 4: return 4;
    default: return 0;
  }
}

export const formatDate = (date?: Date) =>
  date?.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" });

export const daysUntil = (date1?: Date, date2?: Date): number | undefined => {
  if (!date1 || !date2) {
    return undefined;
  }

  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
}
