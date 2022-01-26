import { useMemo } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { shortenAddress, useEthers } from "@usedapp/core";
import { AddressZero } from "@ethersproject/constants";

import client from "../lib/client";
import { CenterLoadingDots } from "../components/CenterLoadingDots";
import { formatPrice } from "../utils";
import { Contracts } from "../const";
import { useChainId } from "../lib/hooks";

const Inventory = () => {
  const { query } = useRouter();
  const { account } = useEthers();
  const chainId = useChainId();
  const normalizedAccount = (query.address as string ?? account ?? AddressZero).toLowerCase();

  const topDeposits = useQuery(
    "topDeposits",
    () =>
      client.getAtlasMineTopDeposits({
        id: Contracts[chainId].atlasMine,
        first: 100,
        skip: 0,
      }),
    { enabled: !!normalizedAccount }
  );

  const leaderboard = useMemo(() => {
    const { deposits = [] } = topDeposits.data?.atlasMine || {};
    return deposits.map(({ id, amount, user, endTimestamp }) => ({
      id,
      amount,
      address: user.id,
      unlockDate: new Date(parseInt(endTimestamp)),
    }))
  }, [topDeposits.data?.atlasMine])

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
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Amount <span className="text-xs text-gray-500">($MAGIC)</span>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Address
                            </th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-300 uppercase tracking-wider">
                              Unlock Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500">
                          {leaderboard.map(({ id, amount, address, unlockDate }, i) => {
                            return (
                              <tr key={id}>
                                <td width="20" className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {i + 1})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {formatPrice(amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <a href={`https://arbiscan.io/address/${address}`} className="hover:underline">
                                    {shortenAddress(address)}
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {unlockDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
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
