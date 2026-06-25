import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";

const Response = ({ message, error }) => {
  console.log(error);
  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 p-4 border rounded-sm",
        error ? "bg-red-500" : "bg-green-500",
      )}
    >
      {message}
    </div>
  );
};

export default Response;
