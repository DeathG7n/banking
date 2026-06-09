/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions,
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };

    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };

    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[],
): CategoryCount[] {
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  // Iterate over each transaction
  transactions &&
    transactions.forEach((transaction) => {
      // Extract the category from the transaction
      const category = transaction.category;

      // If the category exists in the categoryCounts object, increment its count
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        // Otherwise, initialize the count to 1
        categoryCounts[category] = 1;
      }

      // Increment total count
      totalCount++;
    });

  // Convert the categoryCounts object to an array of objects
  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
    (category) => ({
      name: category,
      count: categoryCounts[category],
      totalCount,
    }),
  );

  // Sort the aggregatedCategories array by count in descending order
  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Processing" : "Success";
};

export const authFormSchema = (type: string) =>
  z.object({
    // sign up
    firstName: type === "sign-in" ? z.string().optional() : z.string().min(3),
    lastName: type === "sign-in" ? z.string().optional() : z.string().min(3),
    address: type === "sign-in" ? z.string().optional() : z.string().max(50),
    country: type === "sign-in" ? z.string().optional() : z.string().max(50),
    state:
      type === "sign-in" ? z.string().optional() : z.string().min(2).max(50),
    postalCode:
      type === "sign-in" ? z.string().optional() : z.string().min(3).max(6),
    dateOfBirth: type === "sign-in" ? z.string().optional() : z.string().min(3),
    gender: type === "sign-in" ? z.string().optional() : z.string().min(3),
    maritalStatus:
      type === "sign-in" ? z.string().optional() : z.string().min(6),
    occupation: type === "sign-in" ? z.string().optional() : z.string().min(3),
    mobileNumber:
      type === "sign-in" ? z.string().optional() : z.string().min(3).max(15),
    // both
    email: z.string().email(),
    password: z.string().min(8),
  });

export function generateCardNumber(network: string) {
  let cardNumber = [];

  // 1. Establish network prefixes (IIN) and lengths
  if (network.toLowerCase() === "visa") {
    cardNumber.push(4); // Visa starts with 4
  } else if (network.toLowerCase() === "mastercard") {
    // MasterCard starts with 51-55
    const prefixes = [51, 52, 53, 54, 55];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    cardNumber.push(...randomPrefix.toString().split("").map(Number));
  } else {
    throw new Error("Unsupported network. Use 'visa' or 'mastercard'.");
  }

  // 2. Generate random digits up to length 15 (leaving the 16th for the checksum)
  while (cardNumber.length < 15) {
    cardNumber.push(Math.floor(Math.random() * 10));
  }

  // 3. Compute the Luhn Checksum Digit
  let sum = 0;
  for (let i = 0; i < cardNumber.length; i++) {
    let digit = cardNumber[i];

    // Multiply every second digit from the right by 2
    // Since we are moving left-to-right on a 15-digit array, even indices get doubled
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Same as adding digits together (e.g., 14 -> 1+4=5)
      }
    }
    sum += digit;
  }

  // The final digit must bring the total sum to a multiple of 10
  const checkDigit = (10 - (sum % 10)) % 10;
  cardNumber.push(checkDigit);

  return cardNumber.join("");
}

export function generateCVV() {
  // Generate a random integer between 0 and 999 and pad with leading zeros
  const cvv = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return cvv;
}

export function generateExpiryDate() {
  const date = new Date();
  // Add years to the current year
  date.setFullYear(date.getFullYear() + 3);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  // Get the last two digits of the year
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${year}`;
}

export function validateExpiryDate(expiryStr: string) {
  // Regex to match MM/YY format
  if (!/^\d{2}\/\d{2}$/.test(expiryStr)) return false;

  const [inputMonth, inputYear] = expiryStr.split("/").map(Number);

  // Convert 2-digit year to 4-digit (e.g., 29 to 2029)
  const currentFullYear = new Date().getFullYear();
  const currentCentury = Math.floor(currentFullYear / 100) * 100;
  const inputFullYear = currentCentury + inputYear;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Check if the date is in the past
  if (inputFullYear < currentYear) return false;
  if (inputFullYear === currentYear && inputMonth < currentMonth) return false;

  // Check for valid month (1-12)
  if (inputMonth < 1 || inputMonth > 12) return false;

  return true;
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only image files are supported"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        const MAX_WIDTH = 800;
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          const ratio = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP at 70% quality
        const compressedBase64 = canvas.toDataURL("image/webp", 0.7);

        resolve(compressedBase64);
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
