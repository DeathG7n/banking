"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedCounter from "./AnimatedCounter";
import UpdateInput from "./UpdateInput";
import { useRouter } from "next/navigation";

const ProfileDisplay = ({ user }: { user: User }) => {
  const router = useRouter()
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false)
  const change = (e: any) => {
    setAmount(e.target.value);
  };
  return (
    <section className="flex flex-col pb-5">
      <div className="h-[120px] w-full bg-gradient-mesh bg-cover bg-no-repeat relative">
        <div className="absolute left-10 -bottom-12 flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full">
          <Image
            src={
              user?.avatar ||
              (user?.gender?.toLowerCase() === "male"
                ? "/icons/boy.svg"
                : "/icons/girl.svg")
            }
            alt="account"
            width={100}
            height={100}
          />
        </div>
      </div>
      <div className="px-6 pt-10 mt-5">
        <h1 className="header-4 text-xl md:text-2xl lg:text-3xl">
          Profile Information
        </h1>
        <p>Your personal information and account details</p>
      </div>
      <div className="px-6 mt-5 flex flex-col gap-2">
        <h1 className="header-4">Update Account</h1>
        <UpdateInput
          balance={Number(user?.account?.data?.currentBalance)}
          change={change}
          amount={amount}
          email={user?.email}
          account={user?.account?.data?.accountNumber}
          loading={loading}
          setLoading={setLoading}
          router={router}
        />
      </div>
      <div className="flex flex-wrap px-6 justify-between">
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">First Name</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src="/icons/account.svg"
              alt="account"
              width={25}
              height={25}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.firstName}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Last Name</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/account.svg"}
              alt="account"
              width={25}
              height={25}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.lastName}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Mobile Number</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/account.svg"}
              alt="account"
              width={25}
              height={25}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.mobileNumber}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Gender</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/account.svg"}
              alt="account"
              width={25}
              height={25}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.gender}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Email</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/email.svg"}
              alt="account"
              width={25}
              height={25}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.email}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Date Of Birth</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/date.svg"}
              alt="account"
              width={20}
              height={20}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.dateOfBirth}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Address</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/maps.svg"}
              alt="account"
              width={15}
              height={15}
              className="brightness-[3]"
            />
            <p className="text-gray-500">{user?.address}</p>
          </span>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-[48%] p-2">
          <p className="text-14 text-gray-500">Location</p>
          <span className="px-2 py-3 border rounded-lg flex gap-1 bg-gray-100">
            <Image
              src={"/icons/globe.svg"}
              alt="account"
              width={20}
              height={20}
              className="brightness-[3]"
            />
            <p className="text-gray-500">
              {user?.state}
              {", "}
              {user?.country}
            </p>
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProfileDisplay;
