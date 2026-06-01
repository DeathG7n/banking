"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formUrlQuery, formatAmount } from "@/lib/utils";

export const BankDropdown = ({
  account,
  setValue,
  otherStyles,
}: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState(account);

  const handleBankChange = (id: string) => {
    setSelected(account);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", id);
    }
  };

  return (
    <Select
      onValueChange={(value) => handleBankChange(value)}
    >
      <SelectTrigger
        className={`flex w-full bg-white gap-3 md:w-[300px] ${otherStyles}`}
      >
        <Image
          src="icons/credit-card.svg"
          width={20}
          height={20}
          alt="account"
        />
        <SelectValue placeholder="Select an account" />
        {/* <p className="line-clamp-1 w-full text-left">{account.data.name}</p> */}
      </SelectTrigger>
      <SelectContent
        className={`w-full bg-white md:w-[300px] ${otherStyles}`}
        align="end"
      >
        <SelectGroup>
          <SelectLabel className="py-2 font-normal text-gray-500">
            Select a bank to display
          </SelectLabel>
          <SelectItem
              value={account.data.accountNumber}
              className="cursor-pointer border-t"
            >
              <div className="flex flex-col ">
                <p className="text-16 font-medium">{account.data.name}</p>
                <p className="text-14 font-medium text-blue-600">
                  {formatAmount(account.data.currentBalance)}
                </p>
              </div>
            </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
