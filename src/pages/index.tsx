import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { useEthers } from "@usedapp/core";
import { AddressZero } from "@ethersproject/constants";

import client from "../lib/client";
import { CenterLoadingDots } from "../components/CenterLoadingDots";
import { EthIcon, MagicIcon, SwapIcon } from "../components/Icons";
import { useMagic } from "../context/magicContext";
import { daysUntil, formatDate, formatNumber, getLockupPeriodDisplayText, normalizeDeposit } from "../utils";
import type { Deposit } from "../../generated/graphql";

const Inventory = () => {
  const { query } = useRouter();
  const { account } = useEthers();
  const { ethPrice, usdPrice } = useMagic();
  const [portfolioCurrency, setPortfolioCurrency] = useState<"magic" | "eth">("magic");
  const address = (query.address as string ?? account)?.toLowerCase();

  const userDeposits = useQuery(
    "userDeposits",
    () =>
      client.getUserDeposits({ id: address ?? AddressZero }),
    { enabled: !!address }
  );

  const deposits = useMemo(() => {
    const { deposits = [] } = userDeposits.data?.user || {};
    return deposits.map((deposit) => normalizeDeposit(deposit as Deposit));
  }, [userDeposits.data?.user]);

  const totalDeposited = deposits.reduce((total, { amount }) => total + amount, 0);
  const totalMiningPower = deposits.reduce((total, { miningPower }) => total + miningPower, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-24">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              My Deposits
            </h1>
            {userDeposits.isLoading ? (
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
                            formatNumber(totalDeposited * parseFloat(ethPrice)) :
                            formatNumber(totalDeposited)}{" "}
                        </span>
                      </dd>
                    </div>
                    <div className="flex flex-col px-6 sm:px-8 pt-8">
                      <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        Mining Power
                      </dt>
                      <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                        {formatNumber(totalMiningPower)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <section className="mt-14 pb-14">
                  {deposits.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-36">
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                        No deposits yet 😞
                      </h3>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th scope="col"></th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Amount <span className="text-xs text-gray-500">($MAGIC)</span>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Lockup Period
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Unlock Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Mining Power
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                          {deposits.map(({ id, amount, lock, unlockDate, miningPower }, i) => {
                            const daysUntilUnlock = daysUntil(new Date(), unlockDate);
                            return (
                              <tr key={id}>
                                <td width="20" className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
                                  {formatNumber(miningPower)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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
