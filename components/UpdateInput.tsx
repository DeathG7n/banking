import React from "react";
import { Button } from "./ui/button";
import AnimatedCounter from "./AnimatedCounter";
import { updateBalance } from "@/lib/actions/transaction.actions";

const UpdateInput = ({ amount, change, balance, email }: any) => {
  const submit = async() => {
    const update = await updateBalance({amount, email})
    console.log(update);
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
        className="px-2 py-3 border rounded-lg flex gap-1 bg-blue-400"
        onClick={() => submit()}
      >
        Update
      </Button>
      <AnimatedCounter amount={balance} />
    </div>
  );
};

export default UpdateInput;
