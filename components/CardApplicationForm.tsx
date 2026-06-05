"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

//import { createTransfer } from "@/lib/actions/dwolla.actions";
import { createCard } from "@/lib/actions/bank.actions";
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
import { Textarea } from "./ui/textarea";
import { TransferLedgerSweepSimulateEventType } from "plaid";

let activeAccounts: string[] = [];
let user: User;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  cardType: z.string().min(4, "Please select a card type."),
  // Validation for a single mandatory file
  avatar: z
    .instanceof(File, { message: "Please select an image file." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png and .webp formats are supported.",
    ),
  identification: z
    .instanceof(File, { message: "Please select an image file." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png and .webp formats are supported.",
    ),
});

const CardApplicationForm = () => {
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
      cardType: "",
      avatar: undefined,
      identification: undefined,
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const [avatar, identification] = await Promise.all([
        fileToBase64(data.avatar),
        fileToBase64(data.identification),
      ]);

      const cardApplicationParams = {
        type: data.cardType,
        avatar,
        identification,
      };

      const card = await createCard(cardApplicationParams);

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
          name="cardType"
          render={() => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Select Card Type
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Select the type of card you would like to use
                  </FormDescription>
                </div>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <CardDropdown
                      setValue={form.setValue}
                      otherStyles="!w-full"
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
          name="avatar"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Upload your image
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Upload a copy of your passport size photo colored
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

        <FormField
          control={form.control}
          name="identification"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Upload a form identification
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Upload a copy of your international passport or any ID card
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

export default CardApplicationForm;
