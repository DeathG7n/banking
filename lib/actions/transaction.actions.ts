"use server";

import { parseStringify } from "../utils";
import { MongoClient, ObjectId } from "mongodb";

export const createTransaction = async (
  transaction: CreateTransactionProps,
) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    console.log("createTransaction input:", {
      description: transaction?.description,
      amount: transaction?.amount,
      email: transaction?.email,
      bankName: transaction?.bankName,
      remark: transaction?.remark,
    });

    let sender = transaction?.email
      ? await db.collection("users").findOne({ email: transaction.email })
      : null;

    if (!sender && transaction?.sender?.account?.data?.accountNumber != null) {
      const senderAcc = Number(transaction.sender.account.data.accountNumber);
      const users = await db.collection("users").find({}).toArray();
      sender =
        users.find(
          (u) => Number(u?.account?.data?.accountNumber) === senderAcc,
        ) ?? null;
    }

    if (!sender?.account) {
      console.log("createTransaction: sender not found");
      return null;
    }

    if (!Array.isArray(sender.account.transactions)) {
      sender.account.transactions = [];
    }

    let senderTransaction;
    let receiverTransaction;

    if (transaction.description === "Withdraw") {
      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: Number(sender.account.data?.accountNumber),
        receiver: Number(
          transaction.receiver?.account?.data?.accountNumber ??
            sender.account.data?.accountNumber,
        ),
        email: transaction.email,
        createdAt: new Date(),
        category: "Debit",
        bankName: transaction.bankName || "",
        accountType: transaction.accountType || "Online Banking",
        recipientName: transaction.recipientName || "",
        remark: transaction.remark || "",
      };

      // Newest first
      sender.account.transactions.unshift(senderTransaction);

      const updateResult = await db.collection("users").updateOne(
        { _id: sender._id },
        { $set: { account: sender.account } },
      );

      console.log(
        "createTransaction (Withdraw) matched:",
        updateResult.matchedCount,
        "modified:",
        updateResult.modifiedCount,
      );

      if (updateResult.matchedCount === 0) return null;
    } else {
      let receiver = null;

      if (transaction?.receiver?.account?.data?.accountNumber != null) {
        const receiverAcc = Number(
          transaction.receiver.account.data.accountNumber,
        );
        const users = await db.collection("users").find({}).toArray();
        receiver =
          users.find(
            (u) => Number(u?.account?.data?.accountNumber) === receiverAcc,
          ) ?? null;
      }

      if (!receiver?.account) {
        console.log("createTransaction: receiver not found");
        return null;
      }

      if (!Array.isArray(receiver.account.transactions)) {
        receiver.account.transactions = [];
      }

      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: Number(sender.account.data?.accountNumber),
        receiver: Number(receiver.account.data?.accountNumber),
        email: transaction.email,
        createdAt: new Date(),
        category: "Debit",
        bankName: transaction.bankName || "",
        accountType: transaction.accountType || "Online Banking",
        recipientName: transaction.recipientName || "",
        remark: transaction.remark || "",
      };

      receiverTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: Number(sender.account.data?.accountNumber),
        receiver: Number(receiver.account.data?.accountNumber),
        email: transaction.email,
        createdAt: new Date(),
        category: "Credit",
        bankName: transaction.bankName || "",
        accountType: transaction.accountType || "Online Banking",
        recipientName: transaction.recipientName || "",
        remark: transaction.remark || "",
      };

      sender.account.transactions.unshift(senderTransaction);
      receiver.account.transactions.unshift(receiverTransaction);

      await db.collection("users").updateOne(
        { _id: sender._id },
        { $set: { account: sender.account } },
      );
      await db.collection("users").updateOne(
        { _id: receiver._id },
        { $set: { account: receiver.account } },
      );
    }

    return parseStringify({
      sender: senderTransaction,
      receiver: receiverTransaction ?? null,
    });
  } catch (error) {
    console.log("createTransaction error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const getTransactionsByAccountId = async ({
  accountId,
}: getTransactionsByAccountIdProps) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    const user = await db.collection<User>("users").findOne({
      _id: new ObjectId(accountId),
    });

    if (!user?.account?.transactions) return [];

    const sorted = [...user.account.transactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return parseStringify(sorted);
  } catch (error) {
    console.log("getTransactionsByAccountId error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const createTransfer = async ({ ...transferParams }: TransferParams) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    const users = await db.collection("users").find({}).toArray();

    const sender = users.find(
      (user) =>
        Number(user?.account?.data?.accountNumber) ===
        Number(transferParams.sender?.data?.accountNumber),
    );
    const receiver = users.find(
      (user) =>
        Number(user?.account?.data?.accountNumber) ===
        Number(transferParams.receiver?.data?.accountNumber),
    );

    if (!sender?._id || !receiver?._id) {
      console.log("createTransfer: sender or receiver not found");
      return null;
    }

    transferParams.sender.data.currentBalance =
      Number(transferParams.sender.data.currentBalance) -
      Number(transferParams.amount);
    transferParams.receiver.data.currentBalance =
      Number(transferParams.receiver.data.currentBalance) +
      Number(transferParams.amount);

    await db.collection("users").updateOne(
      { _id: sender._id },
      { $set: { account: transferParams.sender } },
    );
    await db.collection("users").updateOne(
      { _id: receiver._id },
      { $set: { account: transferParams.receiver } },
    );

    return parseStringify({ sender, receiver });
  } catch (error) {
    console.log("createTransfer error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const addToBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("addToBalance: MONGODB_URI missing");
    return null;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    if (!email) {
      console.log("addToBalance: email empty");
      return null;
    }

    const user = await db.collection("users").findOne({ email });
    if (!user?.account?.data) {
      console.log("addToBalance: user/account missing for", email);
      return null;
    }

    const newBalance =
      Number(user.account.data.currentBalance) + Number(amount);

    const updateResult = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          "account.data.currentBalance": newBalance,
          "account.deposit": "",
        },
      },
    );

    console.log(
      "addToBalance matched:",
      updateResult.matchedCount,
      "modified:",
      updateResult.modifiedCount,
    );

    if (updateResult.matchedCount === 0) return null;

    const updated = await db.collection("users").findOne({ email });
    return parseStringify(updated);
  } catch (error) {
    console.log("addToBalance error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const subtractFromBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("subtractFromBalance: MONGODB_URI missing");
    return null;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    console.log(
      "subtractFromBalance called with email:",
      email,
      "amount:",
      amount,
    );

    if (!email) {
      console.log("subtractFromBalance: email empty");
      return null;
    }

    const withdrawAmount = Number(amount);
    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      console.log("subtractFromBalance: invalid amount", amount);
      return null;
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      console.log("subtractFromBalance: NO USER for email:", email);
      return null;
    }

    if (!user.account?.data) {
      console.log("subtractFromBalance: no account.data for", email);
      return null;
    }

    const currentBalance = Number(user.account.data.currentBalance);
    console.log("subtractFromBalance: currentBalance =", currentBalance);

    if (withdrawAmount > currentBalance) {
      console.log("subtractFromBalance: insufficient funds");
      return null;
    }

    const newBalance = currentBalance - withdrawAmount;

    const updateResult = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          "account.data.currentBalance": newBalance,
        },
      },
    );

    console.log(
      "subtractFromBalance matched:",
      updateResult.matchedCount,
      "modified:",
      updateResult.modifiedCount,
      "newBalance:",
      newBalance,
    );

    if (updateResult.matchedCount === 0) {
      console.log("subtractFromBalance: update matched 0 docs");
      return null;
    }

    const updated = await db.collection("users").findOne({ email });
    return parseStringify(updated);
  } catch (error) {
    console.log("subtractFromBalance error:", error);
    return null;
  } finally {
    await client.close();
  }
};