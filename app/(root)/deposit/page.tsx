import HeaderBox from "@/components/HeaderBox";
import Copy from "@/components/Copy";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import React from "react";
import DepositForm from "@/components/DepositForm";

const Deposit = async () => {
  const loggedIn = await getLoggedInUser();
  const account = loggedIn.account;
  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox title="Deposit" subtext="Top Up your account balance." />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2 relative">
            <h2 className="text-18 font-bold text-white">
              {account?.data.name}
            </h2>
            <p className="text-14 text-blue-25">MONIEPOINT </p>
            <p className="text-24 font-semibold tracking-[1.1px] text-white">
              {account?.data.accountNumber}
            </p>
            <div className="absolute bottom-0 right-0 lg:right-[-40px]">
              <Copy title={String(account?.data.accountNumber)} />
            </div>
          </div>

          <div className="transactions-account-balance">
            <p className="text-14">Current balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>
      </div>
      <section className="size-full pt-5">
        <DepositForm />
      </section>
    </div>
  );
};

export default Deposit;
