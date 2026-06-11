import React from "react";
import { Button } from "./ui/button";
import AnimatedCounter from "./AnimatedCounter";
import {
  createTransaction,
  addToBalance,
  subtractFromBalance
} from "@/lib/actions/transaction.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { Loader2 } from "lucide-react";

const UpdateInput = ({
  amount,
  change,
  balance,
  email,
  useRef,
  loading,
  setLoading,
  router,
}: any) => {
  const deposit = async () => {
    try {
      setLoading(true);

      const update = await addToBalance({ amount, email });

      if (update) {
        const sender = await getLoggedInUser();

        const transaction = {
          description: "Deposit",
          amount : String(amount),
          status: "Success",
          sender,
          receiver: update,
          email,
        };

        const newTransaction = await createTransaction(transaction);

        if (newTransaction) {
          router.refresh();
          useRef.current.value = null
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const withdraw = async () => {
    try {
      setLoading(true);

      const update = await subtractFromBalance({ amount, email });

      if (update) {
        const sender = await getLoggedInUser();

        const transaction = {
          description: "Withdraw",
          amount : String(amount),
          status: "Success",
          sender,
          receiver: update,
          email,
        };

        const newTransaction = await createTransaction(transaction);

        if (newTransaction) {
          router.refresh();
          useRef.current.value = null
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row gap-2 content-center">
      <input
        type="number"
        className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100"
        placeholder="Update account balance"
        onChange={(e) => change(e)}
        ref = {useRef}
      />
      <Button
        type="submit"
        disabled={loading}
        className="px-2 py-3 border rounded-lg flex gap-1 bg-blue-400"
        onClick={() => deposit()}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
          </>
        ) : (
          "Deposit"
        )}
      </Button>
      <Button
        type="submit"
        disabled={loading}
        className="px-2 py-3 border rounded-lg flex gap-1 bg-blue-400"
        onClick={() => withdraw()}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
          </>
        ) : (
          "Withdraw"
        )}
      </Button>
      <AnimatedCounter amount={balance} />
    </div>
  );
};

export default UpdateInput;
