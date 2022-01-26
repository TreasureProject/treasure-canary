import { formatEther } from "ethers/lib/utils";
import { BigNumberish } from "ethers";
import type { Deposit } from "../generated/graphql";

const UNITS = ["", "K", "M", "B", "T", "Q"];

export const generateIpfsLink = (hash: string) => {
  const removedIpfs = hash.substring(7);

  return `https://treasure-marketplace.mypinata.cloud/ipfs/${removedIpfs}`;
};

export const formatNumber = (number: number) =>
  new Intl.NumberFormat().format(number);

export const formatPrice = (price: BigNumberish) =>
  formatNumber(parseFloat(formatEther(price)));

export const abbreviatePrice = (number: string) => {
  if (!number) return 0;

  let formatted_number = parseFloat(formatEther(number));
  let unit_index = 0;

  while (Math.floor(formatted_number / 1000.0) >= 1) {
    // Jump up a 1000 bracket and round to 1 decimal
    formatted_number = Math.round(formatted_number / 100.0) / 10.0;
    unit_index += 1;
  }

  const unit = UNITS[unit_index] ?? "";

  return formatted_number.toFixed(1).replace(/\.0+$/, "") + unit;
};

// takes a Collection Name and tries to return a user-friendly slug for routes
// can return undefined if chainId is missing, or address lookup fails
export function getCollectionSlugFromName(
  collectionName: string | null | undefined
): string | undefined {
  return collectionName?.replace(/\s+/g, "-")?.toLowerCase();
}

export const normalizeDeposit = (deposit: Partial<Deposit>) => {
  const {
    id,
    amount,
    user: { id: address } = {},
    endTimestamp = 0,
  } = deposit;
  return {
    id,
    amount,
    address,
    unlockDate: new Date(parseInt(endTimestamp)),
  };
};