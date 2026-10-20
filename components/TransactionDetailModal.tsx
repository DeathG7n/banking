"use client";

import { X, FileText, AlertTriangle } from "lucide-react";
import { formatAmount, formatDateTime } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};

const TransactionDetailModal = ({ isOpen, onClose, transaction }: Props) => {
  if (!isOpen || !transaction) return null;

  const amount = formatAmount(Number(transaction.amount));
  const isDebit = transaction.category === "Debit";
  const dateTime = formatDateTime(new Date(transaction.createdAt));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:w-[90%] md:w-[480px] max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5 text-slate-800">
            <FileText className="h-5 w-5 text-slate-600 shrink-0" />
            <h2 className="font-semibold text-[16px] sm:text-[17px]">
              Transaction Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Transfer Summary
            </h3>

            <Row label="Amount">
              <span
                className={`font-semibold ${
                  isDebit ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {isDebit ? `-${amount}` : amount}
              </span>
            </Row>

            {transaction.recipientName ? (
              <Row label="Recipient">
                <span className="font-medium text-slate-700 text-right break-words max-w-[60%]">
                  {transaction.recipientName}
                </span>
              </Row>
            ) : null}

            <Row label="Account Number">
              <span className="font-medium text-slate-700">
                {transaction.receiver ?? transaction.sender ?? "—"}
              </span>
            </Row>

            <Row label="Bank">
              <span className="font-medium text-slate-700 text-right break-words max-w-[60%]">
                {transaction.bankName || "—"}
              </span>
            </Row>

            <Row label="Account Type">
              <span className="font-medium text-slate-700">
                {transaction.accountType || "Online Banking"}
              </span>
            </Row>

            <Row label="Status">
              <span className="font-medium text-slate-700">
                {transaction.status}
              </span>
            </Row>

            <Row label="Category">
              <span className="font-medium text-slate-700">
                {transaction.category}
              </span>
            </Row>

            <Row label="Remark">
              <span className="font-medium text-slate-700 text-right break-words max-w-[60%]">
                {transaction.remark || "—"}
              </span>
            </Row>

            <hr className="border-gray-200/60" />

            <Row label="Total">
              <span className="font-bold text-slate-800">{amount}</span>
            </Row>

            <Row label="Date">
              <span className="font-medium text-slate-700 text-right text-[13px]">
                {dateTime.dateOnly}
              </span>
            </Row>

            <Row label="Time">
              <span className="font-medium text-slate-700 text-right text-[13px]">
                {dateTime.timeOnly ?? dateTime.dateTime}
              </span>
            </Row>

            <Row label="Description">
              <span className="font-medium text-slate-700 text-right break-words max-w-[60%]">
                {transaction.description}
              </span>
            </Row>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 sm:p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-800/80 font-medium">
              This is a record of a past transaction. Details cannot be changed
              from here.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#1d357d] py-3.5 px-4 font-semibold text-white shadow-sm hover:bg-[#162a64] active:bg-[#11204c] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      {children}
    </div>
  );
}

export default TransactionDetailModal;