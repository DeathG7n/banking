"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createWithdraw } from "@/lib/actions/bank.actions";
import {
  getActiveAccounts,
  getAccountById,
  getLoggedInUser,
} from "@/lib/actions/user.actions";
import { fileToBase64 } from "@/lib/utils";

import { CardDropdown } from "./CardDropdown";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

let activeAccounts: string[] = [];
let user: User;

const formSchema = z.object({
  account: z.string().min(4, "Please enter your account name."),
  amount: z.string().min(1, "Please enter your withdrawal amount."),
  bankName: z.string().min(4, "Please enter your bank name."),
});

const WithdrawForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState<Data | null>(null);

  const getAccounts = async () => {
    user = await getLoggedInUser();
    activeAccounts = await getActiveAccounts();
  };
  getAccounts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      amount: "",
      bankName: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const withDrawParams = {
        account: data.account,
        amount: Number(data.amount),
        bankName: data.bankName,
      };

      const withdraw = await createWithdraw(withDrawParams);

      if (withdraw) {
        form.reset();
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Recipient&apos;s Account Number
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="834858848"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Amount
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="834858848"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Bank Name
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="834858848"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="payment-transfer_btn-box">
          <Button
            type="submit"
            disabled={isLoading}
            className="payment-transfer_btn"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WithdrawForm;
