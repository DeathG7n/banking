import React from "react";
import { Button } from "./ui/button";
import AnimatedCounter from "./AnimatedCounter";
import {
  createTransaction,
  updateBalance,
} from "@/lib/actions/transaction.actions";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { Loader2 } from "lucide-react";

const UpdateInput = ({
  amount,
  change,
  balance,
  email,
  account,
  loading,
  setLoading,
}: any) => {
  const submit = async () => {
    setLoading(true);
    const update = await updateBalance({ amount, email });
    // create transfer transaction
    if (update) {
      const sender = await getLoggedInUser();
      const transaction = {
        description: "Deposit",
        amount: amount,
        status: "Success",
        sender: sender,
        receiver: update,
        email: email,
      };

      const newTransaction = await createTransaction(transaction);

      if (newTransaction) {
        redirect(`/profile/${account}`);
      }
    }
    setLoading(false);
  };
  return (
    <div className="flex gap-2 content-center">
      <input
        type="number"
        className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100"
        placeholder="Update account balance"
        onChange={(e) => change(e)}
      />
      <Button
        type="submit"
        disabled={loading}
        className="px-2 py-3 border rounded-lg flex gap-1 bg-blue-400"
        onClick={() => submit()}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
          </>
        ) : (
          "Update"
        )}
      </Button>
      <AnimatedCounter amount={balance} />
    </div>
  );
};

export default UpdateInput;
