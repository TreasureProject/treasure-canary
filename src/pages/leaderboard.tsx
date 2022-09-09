import { useMemo } from "react";
import { useQuery } from "react-query";
import { shortenAddress } from "@usedapp/core";

import client from "../lib/client";
import { CenterLoadingDots } from "../components/CenterLoadingDots";
import { daysUntil, formatDate, formatPrice } from "../utils";
import { Contracts } from "../const";
import { useChainId } from "../lib/hooks";
import Link from "next/link";

const Inventory = () => {
  const chainId = useChainId();

  const topDeposits = useQuery("topDeposits", () =>
    client.getAtlasMineTopDeposits({
      id: Contracts[chainId].atlasMine,
      first: 100,
      skip: 0,
    })
  );

  const leaderboard = useMemo(() => {
    const { deposits = [] } = topDeposits.data?.atlasMine || {};
    return deposits.map(({ id, amount, user, endTimestamp }) => ({
      id,
      amount,
      address: user.id,
      unlockDate: new Date(parseInt(endTimestamp)),
    }));
  }, [topDeposits.data?.atlasMine]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-24">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Leaderboard
            </h1>
            {topDeposits.isLoading ? (
              <section className="mt-14 pb-14">
                <CenterLoadingDots className="h-36" />
              </section>
            ) : (
              <>
                <section className="mt-14 pb-14">
                  {leaderboard.length === 0 ? (
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
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider"
                            >
                              Amount{" "}
                              <span className="text-xs text-gray-500">
                                ($MAGIC)
                              </span>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider"
                            >
                              Address
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider"
                            >
                              Unlock Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                          {leaderboard.map(
                            ({ id, amount, address, unlockDate }, i) => {
                              const daysUntilUnlock = daysUntil(
                                new Date(),
                                unlockDate
                              );
                              return (
                                <tr key={id}>
                                  <td
                                    width="20"
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"
                                  >
                                    {i + 1})
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {formatPrice(amount)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                      href={`/?address=${address}`}
                                      passHref
                                    >
                                      <a className="hover:underline">
                                        {shortenAddress(address)}
                                      </a>
                                    </Link>
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
                                </tr>
                              );
                            }
                          )}
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
