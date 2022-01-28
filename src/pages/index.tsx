import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { shortenAddress, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";

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
} from "../utils";
import type { Deposit, LegionInfo, TreasureInfo } from "../../generated/graphql";
import { useBridgeworld } from "../lib/hooks";
import { Tooltip } from "../components/Tooltip";
import ImageWrapper from "../components/ImageWrapper";
import Button from "../components/Button";
import { EMISSIONS_PER_HOUR } from "../const";
import NewDepositRow, { NewDepositData } from "../components/NewDepositRow";

type Metadata = LegionInfo | TreasureInfo;

const Inventory = () => {
  const { query } = useRouter();
  const { account } = useEthers();
  const { ethPrice } = useMagic();
  const [portfolioCurrency, setPortfolioCurrency] = useState<"magic" | "eth">("magic");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDeposits, setEditDeposits] = useState([] as any[]);
  const [editNfts, setEditNfts] = useState([] as any[]);
  const { totalLpToken = 0 } = useBridgeworld();
  const address = (query.address as string ?? account)?.toLowerCase();

  const fetchedDeposits = useQuery(
    `deposits-${address}`,
    () =>
      client.getUserDeposits({ id: address ?? AddressZero }),
    { enabled: !!address }
  );

  const [userDeposits, userNftBoost, userNfts] = useMemo(() => {
    const { deposits = [], boost = "0", staked = [] } = fetchedDeposits.data?.user || {};
    const boostPct = boost !== "" ? parseFloat(boost) : 0;
    return [
      deposits.map((deposit) => normalizeDeposit(deposit as Deposit)),
      boostPct,
      staked.sort((n1, n2) =>
        parseFloat((n2.token.metadata as Metadata).boost) - parseFloat((n1.token.metadata as Metadata).boost)),
    ];
  }, [fetchedDeposits.data?.user]);

  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setEditDeposits(userDeposits);
      setEditNfts(userNfts);
      setIsEditMode(true);
    }
  }

  const addDeposit = (deposit: NewDepositData) => {
    setEditDeposits((current) => [...current, deposit]);
  };

  const removeDeposit = (id: string) => {
    setEditDeposits((current) => current.filter(({ id: depositId }) => depositId !== id));
  };

  const removeNft = (id: string) => {
    setEditNfts((current) => current.filter(({ id: nftId }) => nftId !== id));
  };

  const isMyDashboard = address && address === account?.toLowerCase();

  const deposits = isEditMode ? editDeposits : userDeposits;
  const nfts = isEditMode ? editNfts : userNfts;
  const nftBoost = isEditMode ?
    editNfts.reduce((total, { quantity, token }) =>
      total + (quantity * parseFloat((token.metadata as Metadata).boost)), 0)
    : userNftBoost;

  const depositsMiningPower = deposits.map(({ amount, lock }) =>
    amount + (getLockupPeriodBoost(lock) * amount) + (amount * nftBoost));
  const totalUserDeposited = deposits.reduce((total, { amount }) => total + amount, 0);
  const totalUserMiningPower = depositsMiningPower.reduce((total, current) => total + current, 0);
  const totalMiningPower = parseFloat(formatEther(totalLpToken));
  const userMiningPowerPct = totalMiningPower ? totalUserMiningPower / totalMiningPower : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-24">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {isMyDashboard ? 'My Dashboard' : address ? `${shortenAddress(address)}'s Dashboard` : 'Dashboard'}
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
                            setPortfolioCurrency((currency) =>
                              currency === "eth" ? "magic" : "eth"
                            )
                          }
                        >
                          <SwapIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          {portfolioCurrency === "eth" ? (
                            <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          ) : (
                            <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl flex">
                        {portfolioCurrency === "eth" ? (
                          <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        ) : (
                          <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                        )}
                        <span className="capsize">
                          {portfolioCurrency === "eth" ?
                            formatNumber(totalUserDeposited * parseFloat(ethPrice)) :
                            formatNumber(totalUserDeposited)}{" "}
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
                        <Tooltip content={`Total Mining Power: ${formatNumber(totalMiningPower)}`} side="bottom">
                          <QuestionMarkCircleIcon className="inline h-5 w-5" aria-hidden="true" />
                        </Tooltip>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(userMiningPowerPct * 100)}%
                      </dd>
                    </div>
                    <div className="relative flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        $MAGIC Rewards/Hour{" "}
                        <Tooltip content="Your share of 23,464,251 MAGIC set to be emitted over the next 8 months" side="bottom">
                          <QuestionMarkCircleIcon className="inline h-5 w-5" aria-hidden="true" />
                        </Tooltip>
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(userMiningPowerPct * EMISSIONS_PER_HOUR)}
                      </dd>
                    </div>
                  </dl>
                </div>
                {isMyDashboard && (
                  <Button className="w-auto mx-auto mt-8" onClick={toggleEditMode}>
                    {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                  </Button>
                )}
                {isEditMode && (
                  <p className="mt-4 mx-auto text-xs text-center text-gray-400" style={{ maxWidth: 500 }}>
                    <span className="font-bold">Note:</span> any actions you take in edit mode are purely hypothetical and will not affect your on-chain position in Bridgeworld.
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
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Amount <span className="text-xs text-gray-500">($MAGIC)</span>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Lockup Period
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Unlock Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Mining Power
                            </th>
                            {isEditMode && (
                              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                          {deposits.map(({ id, amount, lock, unlockDate }, i) => {
                            const daysUntilUnlock = daysUntil(new Date(), unlockDate);
                            return (
                              <tr key={id}>
                                <td width="20" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                      (in {daysUntilUnlock} day{daysUntilUnlock !== 1 ? 's' : ''})
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {formatNumber(depositsMiningPower[i])}
                                </td>
                                {isEditMode && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Button onClick={() => removeDeposit(id)}>Remove</Button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
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
                  <h2 id="staked-heading" className="my-6 text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    Staked NFTs
                  </h2>
                  {nfts.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-20">
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                        No NFTs staked yet
                      </h3>
                    </div>
                  ) : (
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
                                  {formatNumber(parseFloat(metadata.boost) * 100)}% Boost
                                </p>
                              )}
                            </div>
                            {isEditMode && (
                              <Button className="mt-3" onClick={() => removeNft(id)}>Remove</Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
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
