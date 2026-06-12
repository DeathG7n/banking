import HeaderBox from "@/components/HeaderBox";
import { getLoggedInUser, getUsers } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const Users = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const users = await getUsers();
  const loggedIn = await getLoggedInUser();

  if(!loggedIn.admin) redirect("/")

  const account = loggedIn.account;
  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox title="Users" subtext="See all active users" />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">
              {account?.data.name}
            </h2>
            <p className="text-14 text-blue-25"> </p>
            <p className="text-24 font-semibold tracking-[1.1px] text-white">
              {account?.data.accountNumber}
            </p>
          </div>

          <div className="transactions-account-balance">
            <p className="text-14">Current balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          {users.map((user: User) => {
            const withdraw = user.account?.transactions.find(withdraw => withdraw.status === "Processing")
            const pending = Boolean(user.account?.deposit) || Boolean(withdraw);
            return (
              <Link href={`/profile/${user?.account?.data?.accountNumber}`} key={user.email} className={pending ? "text-red-500" : "text-black-100"}>
                {" "}
                {user.email}
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Users;
