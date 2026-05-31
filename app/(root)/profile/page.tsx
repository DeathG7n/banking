import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import React from "react";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();

  console.log(loggedIn);

  return (
    <section className="flex flex-col pb-3">
      <div className="h-[120px] w-full bg-gradient-mesh bg-cover bg-no-repeat relative">
        <div className="border w-[100px] h-[100px] rounded-full bg-bank-green-gradient absolute left-10 -bottom-12"></div>
      </div>
      <div className="px-6 pt-10 mt-5">
        <h1 className="header-4">Profile Information</h1>
        <p>Your personal information and account details</p>
      </div>
      <div className="flex flex-wrap px-6 justify-between">
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">First Name</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.firstName}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">Last Name</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.lastName}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">Email</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.email}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">Date Of Birth</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.dateOfBirth}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">Address</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.address1}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-[48%] p-2">
          <div className="relative size-4"></div>
          <p className="text-14 text-gray-500">Location</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image src={"./icons/account.svg"} alt="account" width={25} height={25} className="brightness-[3]"/>
            <p className="text-gray-500">{loggedIn.city}{", "}{loggedIn.state}</p>
          </span>
        </div>
      </div>

    </section>
  );
};

export default MyBanks;
