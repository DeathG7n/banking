"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createWithdraw } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
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
import {
  createTransaction,
  subtractFromBalance,
} from "@/lib/actions/transaction.actions";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

const WithdrawForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [details, setDetails] = useState({
    account: "",
    bankName: "",
    amount: "",
  });
  const [popup, setPopUp] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const formSchema = z.object({
    account: z.string().min(8),
    amount: z.string().min(1, "Please enter your withdrawal amount."),
    bankName: z.string().min(4, "Please enter your bank name."),
    otp: otp
      ? z.string().min(6, "OTP must contain at least 6 characters").max(6)
      : z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      amount: "",
      bankName: "",
      otp: "",
    },
  });

  const requestOtp = () => {
    setOtp(true);
  };

  const submit = async (data: z.infer<typeof formSchema>) => {
    setDetails(data);
    setPopUp(true);
    if (data.otp === "") return;
  };

  const confirm = async (data: any) => {
    if (data.otp === "") return;
    setIsLoading(true);

    try {
      const withDrawParams = {
        account: data.account,
        amount: Number(data.amount),
        bankName: data.bankName,
      };

      const withdraw = await createWithdraw(withDrawParams);

      if (withdraw) {
        const sender = await getLoggedInUser();
        const updateBalance = {
          amount: data.amount,
          email: sender.email,
        };
        const update = await subtractFromBalance(updateBalance);

        if (update) {
          const transaction = {
            description: "Withdraw",
            amount: String(data.amount),
            status: "Success",
            sender,
            receiver: sender,
            email: sender.email,
          };

          const newTransaction = await createTransaction(transaction);

          if (newTransaction) {
            form.reset();
            router.push("/");
            setPopUp(false)
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const getUser = async () => {
      const sender = await getLoggedInUser();
      setUser(sender);
    };
    getUser();
  }, [user]);

  return (
    <Form {...form}>
      <TransferModal
        isOpen={popup}
        details={details}
        user={user}
        onClose={() => setPopUp(false)}
        onConfirm={() => confirm(details)}
      />
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
                      placeholder="5000"
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
          name="bankName"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Bank Name
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="United Bank of All Nations"
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
        {otp && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="border-t border-gray-200">
                <div className="payment-transfer_form-item py-5">
                  <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                    Enter OTP code
                  </FormLabel>
                  <div className="flex w-full flex-col">
                    <FormControl>
                      <Input
                        placeholder="094384"
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
        )}

        <div className="payment-transfer_btn-box">
          {otp ? (
            <Button
              type="submit"
              disabled={isLoading}
              className="payment-transfer_btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp;
                  Sending...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="payment-transfer_btn"
              onClick={() => requestOtp()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp;
                  Sending...
                </>
              ) : (
                "Request Otp"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default WithdrawForm;

function TransferModal({ isOpen, onClose, onConfirm, user, details }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed backdrop-blur-sm w-screen h-screen top-0 left-0 flex flex-center">
      {/* Modal Container */}
      <div className="w-[90%]  bg-white border rounded-lg flex flex-col gap-2 p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-slate-800">
            <svg
              className="h-5 w-5 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="font-semibold text-slate-800 text-[17px]">
              Confirm Transfer Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5">
          {/* Transfer Summary Card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Transfer Summary
            </h3>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-slate-700">
                ${details.amount}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500">Recipient</span>
              <span className="font-semibold text-slate-800 text-right max-w-[70%]">
                Hi {user?.account?.data.name}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500">Account Number</span>
              <span className="font-medium text-slate-700">
                {details.account}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500">Bank</span>
              <span className="font-medium text-slate-700">
                {details.bankName}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium text-slate-700">Online Banking</span>
            </div>

            <hr className="border-gray-200/60 my-2" />

            <div className="flex justify-between items-start text-sm pt-1">
              <span className="font-medium text-gray-500">Total</span>
              <span className="font-bold text-slate-800">
                ${details.amount}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-400 text-[13px]">
                New Balance After Transfer
              </span>
              <span className="font-medium text-gray-500 text-[13px]">
                $
                {Number(user?.account?.data.currentBalance) -
                  Number(details.amount)}
              </span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-800/80 font-medium">
              Please verify the transfer details carefully before proceeding.
              Once confirmed, transfers cannot be reversed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d357d] py-3.5 px-4 font-semibold text-white shadow-sm hover:bg-[#162a64] active:bg-[#11204c] transition-colors"
            >
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
              Confirm Transfer
            </button>

            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 px-4 font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
