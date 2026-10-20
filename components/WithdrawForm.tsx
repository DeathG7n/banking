"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  createOTP,
  createWithdraw,
  deleteOTP,
} from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import {
  createTransaction,
  subtractFromBalance,
} from "@/lib/actions/transaction.actions";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const WithdrawForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [details, setDetails] = useState<{
    account: string;
    bankName: string;
    amount: string;
    otp?: string;
  }>({
    account: "",
    bankName: "",
    amount: "",
  });
  const [user, setUser] = useState<User | null>(null);

  const formSchema = z.object({
    account: z.string().min(8, "Account number must be at least 8 characters"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine(
        (val) =>
          Number(val) > 0 &&
          Number(val) <= Number(user?.account?.data?.currentBalance ?? 0),
        {
          message: "Amount must be greater than 0 and not exceed balance",
        },
      ),
    bankName: z.string().min(4, "Please enter your bank name."),
    otp: showOtpModal
      ? z
          .string()
          .min(6, "OTP must be 6 digits")
          .max(6, "OTP must be 6 digits")
          .regex(/^\d+$/, "OTP must contain only numbers")
          .refine((val) => Number(val) === Number(user?.otp?.code), {
            message: "Wrong OTP",
          })
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

  useEffect(() => {
    const loadUser = async () => {
      const sender = await getLoggedInUser();
      setUser(sender);

      if (sender?.otp?.code && sender.otp.code !== 0) {
        const expiryTime = 10 * 60 * 1000;
        const createdAt = new Date(sender.otp.createdAt).getTime();
        if (Date.now() - createdAt >= expiryTime) {
          await deleteOTP();
          setUser({
            ...sender,
            otp: { code: 0, createdAt: new Date() },
          });
        }
      }
    };
    loadUser();
  }, []);

  const requestOtp = async () => {
    const valid = await form.trigger(["account", "amount", "bankName"]);
    if (!valid) return;

    setIsLoading(true);
    try {
      const updatedUser = await createOTP();
      if (updatedUser) {
        setUser(updatedUser);
        setShowOtpModal(true);
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.otp) {
      alert("Please enter the OTP");
      return;
    }
    setDetails(data);
    setShowOtpModal(false);
    setShowConfirmModal(true);
  };

  const confirmTransfer = async () => {
    if (!details.otp) {
      alert("OTP is required");
      return;
    }

    setIsConfirming(true);

    try {
      const withDrawParams = {
        account: details.account,
        amount: Number(details.amount),
        bankName: details.bankName,
      };

      const withdraw = await createWithdraw(withDrawParams);
      if (!withdraw) {
        alert("Failed to process withdrawal");
        return;
      }

      const sender = await getLoggedInUser();
      console.log("LOGGED IN USER:", {
        email: sender?.email,
        balance: sender?.account?.data?.currentBalance,
      });

      if (!sender?.email) {
        alert("Session expired. Please sign in again.");
        router.push("/sign-in");
        return;
      }

      const update = await subtractFromBalance({
        amount: details.amount,
        email: sender.email,
      });

      console.log("BALANCE UPDATE RESULT:", update ? "OK" : "FAILED");

      if (!update) {
        alert(
          "Failed to update balance. Check server logs (email / balance / account).",
        );
        return;
      }

      const transaction = {
        description: "Withdraw",
        amount: String(details.amount),
        status: "Success",
        sender,
        receiver: sender,
        email: sender.email,
        bankName: details.bankName,
        accountType: "Online Banking",
        recipientName: details.account,
        remark: `Transfer to ${details.account}`,
      };

      const newTransaction = await createTransaction(transaction);

      if (newTransaction) {
        await deleteOTP();
        form.reset();
        setShowConfirmModal(false);
        router.push("/");
        router.refresh();
      } else {
        alert("Failed to create transaction");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Form {...form}>
      <TransferModal
        isOpen={showConfirmModal}
        details={details}
        user={user}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmTransfer}
        loading={isConfirming}
      />

      <OTPModal
        isOpen={showOtpModal}
        control={form.control}
        onClose={() => setShowOtpModal(false)}
        onConfirm={form.handleSubmit(onOtpSubmit)}
      />

      <form className="flex flex-col">
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

        <div className="payment-transfer_btn-box">
          <Button
            type="button"
            disabled={isLoading || !user}
            className="payment-transfer_btn"
            onClick={requestOtp}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Request OTP"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WithdrawForm;

function TransferModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  details,
  loading,
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed backdrop-blur-sm w-screen h-screen top-0 left-0 flex flex-center z-50">
      <div className="w-[90%] lg:w-[60%] bg-white border rounded-lg flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-slate-800">
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

        <div className="space-y-5">
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
                {Number(user?.account?.data?.currentBalance ?? 0) -
                  Number(details.amount)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-800/80 font-medium">
              Please verify the transfer details carefully before proceeding.
              Once confirmed, transfers cannot be reversed.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d357d] py-3.5 px-4 font-semibold text-white shadow-sm hover:bg-[#162a64] active:bg-[#11204c] transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp;
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 stroke-[2.5]" /> &nbsp;
                  Confirm Transfer
                </>
              )}
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

function OTPModal({ isOpen, onClose, onConfirm, control }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed backdrop-blur-sm w-screen h-screen top-0 left-0 flex flex-center z-50">
      <div className="w-[90%] lg:w-[60%] bg-white border rounded-lg flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-slate-800">
            <h2 className="font-semibold text-slate-800 text-[17px]">
              Enter One Time Password
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <FormField
            control={control}
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
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-12 text-red-500" />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <div className="space-y-3 pt-2">
            <button
              onClick={onConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d357d] py-3.5 px-4 font-semibold text-white shadow-sm hover:bg-[#162a64] active:bg-[#11204c] transition-colors"
            >
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
              Confirm Details
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
