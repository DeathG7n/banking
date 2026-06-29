"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomInput from "./CustomInput";
import Response from "./Response";
import { authFormSchema, fileToBase64 } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLoggedInUser, signIn, signUp } from "@/lib/actions/user.actions";
import CustomFileInput from "./CustomFileInput";
import { createTransaction } from "@/lib/actions/transaction.actions";

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      if (type === "sign-up") {
        const [avatar, identification] = await Promise.all([
          fileToBase64(data.avatar!),
          fileToBase64(data.identification!),
        ]);
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address: data.address!,
          country: data.country!,
          state: data.state!,
          postalCode: data.postalCode!,
          dateOfBirth: data.dateOfBirth!,
          gender: data.gender!,
          maritalStatus: data.maritalStatus!,
          occupation: data.occupation!,
          mobileNumber: data.mobileNumber!,
          avatar,
          identification,
          email: data.email,
          password: data.password,
          otp: {
            code: 0,
            createdAt: "",
          },
          account: {
            data: {
              currentBalance: Number(data.amount!) || 0,
              name: data.firstName! + " " + data.lastName!,
              firstName: data.firstName!,
              lastName: data.lastName!,
              tier: 1,
              type: "savings",
              accountNumber: 0,
            },
            card: {
              cardNumber: 0,
              expiryDate: "",
              cvv: 0,
              type: "",
              mask: "",
            },
            hasCard: false,
            transactions: [] as Transaction[],
            deposit: "",
            withdraw: [] as WithDrawParams[],
          },
        };

        if (Number(data.amount) !== 0) {
          const sender = await getLoggedInUser();
          const transaction = {
            description: "Deposit",
            amount: String(data.amount!),
            status: "Success",
            sender: sender?.account?.data.accountNumber,
            receiver: sender?.account?.data.accountNumber,
            email: data.email!,
            createdAt: new Date(),
            category: "Credit",
          };
          userData?.account?.transactions.push(transaction);
        }

        const response = await signUp(userData);

        setShowPopup(true);
        setError(!response.success);
        setMessage(response.message);

        if (response.success) {
          router.push("/");
        }
      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data.email,
          password: data.password,
        });

        setShowPopup(true);
        setError(!response.success);
        setMessage(response.message);

        if (response.success) {
          router.push("/");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!showPopup) return;

    const timer = setTimeout(() => {
      setShowPopup(false);
      setError(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [showPopup]);

  return (
    <section className="auth-form">
      {showPopup && <Response message={message} error={error} />}
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Norizon
          </h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-white">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
            <p className="text-16 font-normal text-white">
              {user
                ? "Link your account to get started"
                : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4"></div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <CustomInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name"
                    />
                    <CustomInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <CustomInput
                    control={form.control}
                    name="address"
                    label="Address"
                    placeholder="Enter your specific address"
                  />
                  <CustomInput
                    control={form.control}
                    name="country"
                    label="Country"
                    placeholder="Enter your country"
                  />
                  <div className="flex flex-col lg:flex-row gap-4">
                    <CustomInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="Example: NY"
                    />
                    <CustomInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="Example: 11101"
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <CustomInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                    />
                    <CustomInput
                      control={form.control}
                      name="gender"
                      label="Gender"
                      placeholder="Enter your gender"
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <CustomInput
                      control={form.control}
                      name="mobileNumber"
                      label="Mobile Number"
                      placeholder="0**********"
                    />
                    <CustomInput
                      control={form.control}
                      name="maritalStatus"
                      label="Marital Status"
                      placeholder="Your marital status"
                    />
                  </div>
                  <CustomInput
                    control={form.control}
                    name="occupation"
                    label="Occupation"
                    placeholder="What do you do for a living?"
                  />
                  <CustomInput
                    control={form.control}
                    name="amount"
                    label="Amount"
                    placeholder="How much does the user want to start with?"
                  />
                  <CustomFileInput
                    control={form.control}
                    name="avatar"
                    label="Profile Picture"
                    placeholder="Select an image"
                  />

                  <CustomFileInput
                    control={form.control}
                    name="identification"
                    label="Form of Identification"
                    placeholder="Select an image"
                  />
                </>
              )}

              <CustomInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
              />

              <CustomInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
              />

              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="form-btn">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp;
                      Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign up" : "Sign in"}
            </Link>
          </footer> */}
        </>
      )}
    </section>
  );
};

export default AuthForm;
