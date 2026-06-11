"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createCard, createDeposit } from "@/lib/actions/bank.actions";
import {
  getActiveAccounts,
  getAccountById,
  getLoggedInUser,
} from "@/lib/actions/user.actions";
import { fileToBase64 } from "@/lib/utils";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  confirmation: z
    .instanceof(File, { message: "Please select an image file." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png and .webp formats are supported.",
    ),
});

const DepositForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState<Data | null>(null);

  const getAccounts = async () => {
    user = await getLoggedInUser();
    activeAccounts = await getActiveAccounts();
  };
  getAccounts();

  const change = async (e: any) => {
    const receiverBank = await getAccountById({ accountId: e.target.value });
    if (receiverBank) {
      setRecipient(receiverBank.data);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmation: undefined,
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const [confirmation] = await Promise.all([
        fileToBase64(data.confirmation),
      ]);

      const depositParams = {
        confirmation,
      };

      const card = await createDeposit(depositParams);

      if (card) {
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
          name="confirmation"
          render={({ field }) => (
            <FormItem>
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Upload proof
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Upload a screenshot or photo of the transfer
                  </FormDescription>
                </div>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        field.onChange(e.target.files?.[0]);
                      }}
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
              "Apply"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DepositForm;
