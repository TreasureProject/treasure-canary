import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { shortenAddress, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";

import client from "../lib/client";
import { CenterLoadingDots } from "../components/CenterLoadingDots";
import { EthIcon, MagicIcon, SwapIcon } from "../components/Icons";
import { useMagic } from "../context/magicContext";
import {
  daysUntil,
  formatNumber,
  formatDate,
  getLockupPeriodDisplayText,
  normalizeDeposit,
  getLockupPeriodBoost,
  getTotalLpTokens,
} from "../utils";
import type {
  Deposit,
  LegionInfo,
  TreasureInfo,
} from "../../generated/graphql";
import { useChainId } from "../lib/hooks";
import { Tooltip } from "../components/Tooltip";
import ImageWrapper from "../components/ImageWrapper";
import Button from "../components/Button";
import { EMISSIONS_PER_HOUR, legionNfts } from "../const";
import NewDepositRow, { NewDepositData } from "../components/NewDepositRow";
import { SearchAutocomplete } from "../components/SearchAutocomplete";
import { Item } from "react-stately";

type Metadata = LegionInfo | TreasureInfo;

const Inventory = () => {
  const { query } = useRouter();
  const { account } = useEthers();
  const { ethPrice } = useMagic();
  const chainId = useChainId();
  const [currency, setCurrency] = useState<"magic" | "eth">("magic");
  const [rewardTime, setRewardTime] = useState(24);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDeposits, setEditDeposits] = useState([] as any[]);
  const [editNfts, setEditNfts] = useState([] as any[]);
  const [selectedAddNft, setSelectedAddNft] = useState("");
  const [totalLpTokens, setTotalLpTokens] = useState(0);
  const address = ((query.address as string) ?? account)?.toLowerCase();

  useEffect(() => {
    const fetchTotalLpTokens = async () => {
      const nextTotalLpTokens = await getTotalLpTokens(chainId);
      setTotalLpTokens(nextTotalLpTokens);
    };

    const fetchInterval = setInterval(fetchTotalLpTokens, 10000);
    fetchTotalLpTokens();
    return () => clearInterval(fetchInterval);
  }, [chainId]);

  const fetchedDeposits = useQuery(`deposits-${address}`, () =>
    client.getUserDeposits({ id: address ?? AddressZero })
  );

  const [treasures, userDeposits, userNftBoost, userNfts] = useMemo(() => {
    const { treasures = [], user } = fetchedDeposits.data || {};
    const { deposits = [], boost = "0", staked = [] } = user || {};
    const boostPct = boost !== "" ? parseFloat(boost) : 0;
    const groupedStaked: any[] = [];
    staked.forEach((stakedToken) => {
      if (stakedToken.token.category !== "Legion") {
        groupedStaked.push(stakedToken);
        return;
      }

      const index = groupedStaked.findIndex(
        ({ token: { name } }) => name === stakedToken.token.name
      );
      if (index >= 0) {
        groupedStaked[index].quantity = (
          parseInt(groupedStaked[index].quantity) + 1
        ).toString();
      } else {
        groupedStaked.push(stakedToken);
      }
    });
    return [
      treasures,
      deposits.map((deposit) => normalizeDeposit(deposit as Deposit)),
      boostPct,
      groupedStaked,
    ];
  }, [fetchedDeposits.data]);

  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setEditDeposits(userDeposits);
      setEditNfts(userNfts);
      setIsEditMode(true);
    }
  };

  const isMyDashboard = address && address === account?.toLowerCase();

  const deposits = isEditMode ? editDeposits : userDeposits;
  const nfts = (isEditMode ? editNfts : userNfts).sort(
    (n1, n2) =>
      parseFloat((n2.token.metadata as Metadata).boost) -
      parseFloat((n1.token.metadata as Metadata).boost)
  );
  const nftBoost = isEditMode
    ? editNfts.reduce(
        (total, { quantity, token }) =>
          total + quantity * parseFloat((token.metadata as Metadata).boost),
        0
      )
    : userNftBoost;

  const depositsMiningPower = deposits.map(
    ({ amount, lock }) =>
      amount + getLockupPeriodBoost(lock) * amount + amount * nftBoost
  );
  const totalUserDeposited = deposits.reduce(
    (total, { amount }) => total + amount,
    0
  );
  const totalUserMiningPower = depositsMiningPower.reduce(
    (total, current) => total + current,
    0
  );
  const totalMiningPower = parseFloat(formatEther(totalLpTokens));
  const userMiningPowerPct = totalMiningPower
    ? totalUserMiningPower / totalMiningPower
    : 0;
  const nftIds = nfts.map(({ token: { id } }) => id);
  const nftNames = nfts.map(({ token: { name } }) => name);
  const totalTreasureNfts = nfts
    .filter(({ token: { category } }) => category === "Treasure")
    .reduce((total, { quantity }) => total + parseFloat(quantity), 0);
  const totalLegionNfts = nfts
    .filter(({ token: { category } }) => category === "Legion")
    .reduce((total, { quantity }) => total + parseFloat(quantity), 0);
  const availableNfts = [...treasures, ...legionNfts]
    .filter(({ id, name }) => !nftIds.includes(id) && !nftNames.includes(name))
    .sort((n1, n2) => n1.name.localeCompare(n2.name));

  const addDeposit = (deposit: NewDepositData) => {
    setEditDeposits((current) => [...current, deposit]);
  };

  const removeDeposit = (id: string) => {
    setEditDeposits((current) =>
      current.filter(({ id: depositId }) => depositId !== id)
    );
  };

  const increaseNft = (id: string) => {
    const index = editNfts.findIndex(({ id: nftId }) => nftId === id);
    if (index < 0) {
      return;
    }

    setEditNfts((current) => {
      const next = [...current];
      next[index].quantity = (
        parseFloat(current[index].quantity) + 1
      ).toString();
      return next;
    });
  };

  const decreaseNft = (id: string) => {
    const index = editNfts.findIndex(({ id: nftId }) => nftId === id);
    if (index < 0) {
      return;
    }

    setEditNfts((current) => {
      const next = [...current];
      next[index].quantity = (
        parseFloat(current[index].quantity) - 1
      ).toString();
      return next;
    });
  };

  const addNft = () => {
    const token = availableNfts.find(({ id }) => id === selectedAddNft);
    if (token) {
      setEditNfts((current) => [
        ...current,
        {
          id: `${address}-${selectedAddNft}`,
          quantity: 1,
          token: token,
        },
      ]);
      setSelectedAddNft("");
    } else {
      console.log("Attempting to add unknown NFT with ID ", selectedAddNft);
    }
  };

  const removeNft = (id: string) => {
    setEditNfts((current) => current.filter(({ id: nftId }) => nftId !== id));
  };

  const underNftCategoryLimit = (category: string) => {
    if (category === "Legion") {
      return totalLegionNfts < 3;
    }

    return totalTreasureNfts < 20;
  };

  const getNftCategory = (id: string) => {
    return availableNfts.find(({ id: nftId }) => nftId === id)?.category || "";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-24">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {isMyDashboard
                ? "My Dashboard"
                : address
                ? `${shortenAddress(address)}'s Dashboard`
                : "Dashboard"}
            </h1>
            {fetchedDeposits.isLoading ? (
              <section className="mt-14 pb-14">
                <CenterLoadingDots className="h-36" />
              </section>
            ) : (
              <>
                <div className="mt-12 overflow-hidden flex flex-col items-center">
                  <dl className="sm:-mx-8 -mt-8 flex divide-x-2">
                    <div className="flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4 flex">
                        <span className="capsize">Deposited</span>
                        <button
                          className="inline-flex self-end items-center ml-2"
                          onClick={() =>
                            setCurrency((currency) =>
                              currency === "eth" ? "magic" : "eth"
                            )
                          }
                        >
                          <SwapIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          {currency === "eth" ? (
                            <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          ) : (
                            <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl flex">
                        {currency === "eth" ? (
                          <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        ) : (
                          <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        )}
                        <span className="capsize">
                          {currency === "eth"
                            ? formatNumber(
                                totalUserDeposited * parseFloat(ethPrice)
                              )
                            : formatNumber(totalUserDeposited)}{" "}
                        </span>
                      </dd>
                    </div>
                    <div className="flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        NFT Boost
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(nftBoost * 100)}%
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-10 overflow-hidden flex flex-col items-center">
                  <dl className="sm:-mx-8 -mt-8 flex divide-x-2">
                    <div className="flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        Mining Power
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(totalUserMiningPower)}
                      </dd>
                    </div>
                    <div className="relative flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        Share of Mine{" "}
                        <Tooltip
                          content={`Total Mining Power: ${formatNumber(
                            totalMiningPower
                          )}`}
                          side="bottom"
                        >
                          <QuestionMarkCircleIcon
                            className="inline h-5 w-5"
                            aria-hidden="true"
                          />
                        </Tooltip>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(userMiningPowerPct * 100)}%
                      </dd>
                    </div>
                    <div className="flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4 flex">
                        <span className="capsize">
                          Rewards /{" "}
                          <select
                            className="form-select rounded-md border py-0 pl-1 pr-6 dark:text-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:focus:ring-gray-300 dark:focus:border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            value={rewardTime}
                            onChange={(e) =>
                              setRewardTime(parseInt(e.target.value))
                            }
                          >
                            <option value={1}>Hour</option>
                            <option value={24}>Day</option>
                            <option value={168}>Week</option>
                            <option value={720}>Month</option>
                            <option value={8760}>Year</option>
                          </select>
                        </span>
                        {/* <Tooltip content="Your share of 23,464,251 MAGIC set to be emitted over the next 8 months" side="bottom">
                          <QuestionMarkCircleIcon className="inline h-5 w-5" aria-hidden="true" />
                        </Tooltip> */}
                        <button
                          className="inline-flex self-end items-center ml-2"
                          onClick={() =>
                            setCurrency((currency) =>
                              currency === "eth" ? "magic" : "eth"
                            )
                          }
                        >
                          <SwapIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          {currency === "eth" ? (
                            <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          ) : (
                            <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl flex">
                        {currency === "eth" ? (
                          <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        ) : (
                          <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        )}
                        <span className="capsize">
                          {currency === "eth"
                            ? formatNumber(
                                userMiningPowerPct *
                                  EMISSIONS_PER_HOUR *
                                  rewardTime *
                                  parseFloat(ethPrice)
                              )
                            : formatNumber(
                                userMiningPowerPct *
                                  EMISSIONS_PER_HOUR *
                                  rewardTime
                              )}{" "}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                {(isMyDashboard || !address) && (
                  <Button
                    className="w-auto mx-auto mt-8"
                    onClick={toggleEditMode}
                  >
                    {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                  </Button>
                )}
                {isEditMode && (
                  <p
                    className="mt-4 mx-auto text-xs text-center text-gray-400"
                    style={{ maxWidth: 500 }}
                  >
                    <span className="font-bold">Note:</span> any actions you
                    take in edit mode are purely hypothetical and will not
                    affect your on-chain position in Bridgeworld.
                  </p>
                )}
                <section className="mt-14 pb-14">
                  <h2 className="mb-6 text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    Deposit History
                  </h2>
                  {!isEditMode && deposits.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-20">
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                        No deposits yet
                      </h3>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-500">
                        <thead>
                          <tr>
                            <th scope="col"></th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount{" "}
                              <span className="text-xs text-gray-500">
                                ($MAGIC)
                              </span>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Lockup Period
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Unlock Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Mining Power
                            </th>
                            {isEditMode && (
                              <th
                                scope="col"
                                className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                          {deposits.map(
                            ({ id, amount, lock, unlockDate }, i) => {
                              const daysUntilUnlock = daysUntil(
                                new Date(),
                                unlockDate
                              );
                              return (
                                <tr key={id}>
                                  <td
                                    width="20"
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {i + 1})
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {formatNumber(amount)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {getLockupPeriodDisplayText(lock)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {formatDate(unlockDate)}{" "}
                                    {daysUntilUnlock && daysUntilUnlock > 0 && (
                                      <span className="text-sm text-gray-400">
                                        (in {daysUntilUnlock} day
                                        {daysUntilUnlock !== 1 ? "s" : ""})
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {formatNumber(depositsMiningPower[i])}
                                  </td>
                                  {isEditMode && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Button onClick={() => removeDeposit(id)}>
                                        Remove
                                      </Button>
                                    </td>
                                  )}
                                </tr>
                              );
                            }
                          )}
                          {isEditMode && (
                            <NewDepositRow
                              id={`newDeposit-${deposits.length}`}
                              nftBoost={nftBoost}
                              onSubmit={addDeposit}
                            />
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </section>
                <section aria-labelledby="staked-heading" className="my-8">
                  <h2
                    id="staked-heading"
                    className="my-6 text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
                  >
                    Staked NFTs
                  </h2>
                  {!isEditMode && nfts.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-20">
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                        No NFTs staked yet
                      </h3>
                    </div>
                  ) : (
                    <>
                      <ul
                        role="list"
                        className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 gap-x-6 lg:grid-cols-6 xl:gap-x-8"
                      >
                        {nfts.map(({ id, token, quantity }) => {
                          const metadata = (token.metadata || {}) as Metadata;
                          return (
                            <li key={id} className="relative">
                              {(isEditMode || parseFloat(quantity) > 1) && (
                                <span className="absolute top-0 right-0 z-50 px-2 py-1 -mt-2 -mr-2 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
                                  x{quantity}
                                </span>
                              )}
                              <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3">
                                <ImageWrapper
                                  className="w-full h-full object-center object-fill"
                                  token={token}
                                />
                              </div>
                              <div className="mt-4 text-base font-medium text-gray-900 space-y-2">
                                <p className="text-xs text-gray-800 dark:text-gray-50 font-semibold truncate">
                                  {token.name}
                                </p>
                                {metadata.boost && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {formatNumber(
                                      parseFloat(metadata.boost) * 100
                                    )}
                                    % Boost
                                  </p>
                                )}
                              </div>
                              {isEditMode && (
                                <div className="mt-3 flex items-center justify-between space-x-2">
                                  <span
                                    className={`inline h-5 w-5 ${
                                      quantity > 1
                                        ? "cursor-pointer"
                                        : "text-gray-300 dark:text-gray-700"
                                    }`}
                                    onClick={
                                      quantity > 1
                                        ? () => decreaseNft(id)
                                        : undefined
                                    }
                                  >
                                    <ChevronDownIcon />
                                  </span>
                                  <Button onClick={() => removeNft(id)}>
                                    Remove
                                  </Button>
                                  <span
                                    className={`inline h-5 w-5 ${
                                      underNftCategoryLimit(token.category)
                                        ? "cursor-pointer"
                                        : "text-gray-300 dark:text-gray-700"
                                    }`}
                                    onClick={
                                      underNftCategoryLimit(token.category)
                                        ? () => increaseNft(id)
                                        : undefined
                                    }
                                  >
                                    <ChevronUpIcon />
                                  </span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {isEditMode && (
                        <div className="mt-8 grid grid-cols-6 gap-2">
                          <div className="col-span-5">
                            <SearchAutocomplete
                              label="Search NFTs"
                              placeholder="Search NFTs..."
                              onSelectionChange={(id) => {
                                setSelectedAddNft(id as string);
                              }}
                            >
                              {availableNfts.map(({ id, name }) => (
                                <Item key={id}>{name}</Item>
                              )) ?? []}
                            </SearchAutocomplete>
                          </div>
                          <Button
                            onClick={addNft}
                            disabled={
                              !underNftCategoryLimit(
                                getNftCategory(selectedAddNft)
                              )
                            }
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
