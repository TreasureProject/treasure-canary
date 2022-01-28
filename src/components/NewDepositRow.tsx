import { useMemo, useState } from "react";
import { formatDate, formatNumber, getLockupPeriodBoost, getLockupPeriodDisplayText, getLockUpPeriodInSeconds } from "../utils";
import Button from "./Button";

export type NewDepositData = {
  id: string;
  amount: number;
  lock: number;
  unlockDate: Date;
};

const NewDepositRow = ({
  id,
  nftBoost,
  onSubmit,
}: {
  id: string,
  nftBoost: number,
  onSubmit: (data: NewDepositData) => void,
}) => {
  const [amount, setAmount] = useState("0")
  const [lock, setLock] = useState("0");

  const unlockDate = useMemo(() => {
    const lockSeconds = getLockUpPeriodInSeconds(parseInt(lock));
    return new Date(new Date().getTime() + (lockSeconds * 1000));
  }, [lock]);

  const miningPower = useMemo(() => {
    const parsedAmount = parseFloat(amount);
    const lockBoost = getLockupPeriodBoost(parseInt(lock));
    return parsedAmount + (lockBoost * parsedAmount) + (nftBoost * parsedAmount);
  }, [amount, lock, nftBoost]);

  const handleSubmit = () => {
    onSubmit({
      id,
      amount: parseFloat(amount),
      lock: parseInt(lock),
      unlockDate,
    });
    setAmount("0");
    setLock("0");
  };

  return (
    <tr>
      <td width="20"></td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          className="form-input focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 dark:placeholder-gray-400 rounded-md disabled:placeholder-gray-300 disabled:text-gray-300 transition-placeholder transition-text ease-linear duration-300 disabled:cursor-not-allowed"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          className="form-select rounded-md border dark:text-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:focus:ring-gray-300 dark:focus:border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm w-full"
          value={lock}
          onChange={(e) => setLock(e.target.value)}
        >
          {Array(5).fill(0).map((_, i) => (
            <option key={i} value={i}>{getLockupPeriodDisplayText(i)}</option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatDate(unlockDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatNumber(miningPower)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Button onClick={handleSubmit}>Add</Button>
      </td>
    </tr>
  )
};

export default NewDepositRow;
