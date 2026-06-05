"use client";

import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CardDropdown = ({ setValue, otherStyles }: CardDropdownProps) => {

  const cardTypes = [
    {
      name : "Visa",
      type : "visa"
    },
    {
      name : "Mastercard",
      type : "mastercard"
    },
  ];

  const handleTypeChange = (id: string) => {
    if (setValue) {
      setValue("cardType", id);
    }
  };

  return (
    <Select onValueChange={(value) => handleTypeChange(value)}>
      <SelectTrigger
        className={`flex w-full bg-white gap-3 md:w-[300px] ${otherStyles}`}
      >
        <Image
          src="icons/credit-card.svg"
          width={20}
          height={20}
          alt="account"
        />
        <SelectValue placeholder="Select a card type" />
        {/* <p className="line-clamp-1 w-full text-left">{account.data.name}</p> */}
      </SelectTrigger>
      <SelectContent
        className={`w-full bg-white md:w-[300px] ${otherStyles}`}
        align="end"
      >
        <SelectGroup>
          <SelectLabel className="py-2 font-normal text-gray-500">
            Select a card type
          </SelectLabel>

          {cardTypes.map((type) => {
            return (
              <SelectItem
                value={type.type}
                className="cursor-pointer border-t"
              >
                <div className="flex flex-col ">
                  <p className="text-16 font-medium">{type.name}</p>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
