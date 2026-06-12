"use client";

import Image from "next/image";
import AnimatedCounter from "./AnimatedCounter";
import Copy from "./Copy";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const TotalBalanceBox = ({ user }: TotalBalanceBoxProps) => {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    const hour = time.getHours();

    if (hour < 12) {
      setGreeting("Good morning ☀️");
    } else if (hour < 18) {
      setGreeting("Good afternoon 🌤️");
    } else {
      setGreeting("Good evening 🌙");
    }

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-GB", {
    hour12: false,
  });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <section className="total-balance">
      <div className="flex justify-between gap-6">
        <div className="flex gap-2 flex-center">
          <div className="w-16 rounded-full h-16 flex flex-center">
            <Image
              src={
                user.avatar ||
                (user.gender?.toLowerCase() === "male"
                  ? "/icons/boy.svg"
                  : "/icons/girl.svg")
              }
              alt="account"
              width={100}
              height={100}
            />
          </div>
          <div className="w-fit">
            <h1 className="text-10 lg:text-16 text-gray-700">{greeting}</h1>
            <h1 className="header-1">{user?.account?.data.firstName}</h1>
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className="text-20 text-white text-right font-bold"
            suppressHydrationWarning
          >
            {formattedTime}
          </span>
          <span
            className="text-10 lg:text-12 font-light text-right font-bold"
            suppressHydrationWarning
          >
            {formattedDate}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="header-2">Available Balance:</h2>
        <AnimatedCounter amount={Number(user?.account?.data.currentBalance)} />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:justify-between p-3 bg-white/20 backdrop-blur-md  border-white/30 rounded-xl">
        <div className="flex flex-col gap-1 relative">
          <h1 className="text-16 font-normal flex gap-1">
            Your Account Number{" "}
            <span className="flex justify-center content-center bg-green-100 text-green-900 px-2 py-1 rounded-full text-10">
              .{user?.account?.data.type}
            </span>
          </h1>
          <h1 className="header-1">{user?.account?.data.accountNumber}</h1>
          <div className="absolute top-[-25px] right-0 lg:right-[-45px]">
            <Copy title={String(user?.account?.data.accountNumber)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="px-2 py-3 rounded-lg flex gap-1 bg-green-500"
            onClick={()=> router.push("/deposit")}
          >
            Deposit
          </Button>
          <Button
            type="submit"
            className="px-2 py-3 rounded-lg flex gap-1 bg-red-500"
            onClick={()=> router.push("/transfer")}
          >
            Transfer
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TotalBalanceBox;
