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
    const users = await db.collection("users").find({}).toArray();

    const sender = users.find(
      (user) =>
        user?.account?.data?.accountNumber ===
        transaction?.sender?.account?.data?.accountNumber,
    );
    const receiver = users.find(
      (user) =>
        user?.account?.data?.accountNumber ===
        transaction?.receiver?.account?.data?.accountNumber,
    );

    if (!sender?.account) {
      console.log("createTransaction: sender not found");
      return null;
    }

    const senderTransactions = Array.isArray(sender.account.transactions)
      ? sender.account.transactions
      : [];

    let senderTransaction;
    let receiverTransaction;

    if (transaction.description === "Withdraw") {
      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: transaction.sender?.account?.data?.accountNumber,
        receiver: transaction.receiver?.account?.data?.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Credit",
      };

      senderTransactions.push(senderTransaction);
      sender.account.transactions = senderTransactions;

      await db
        .collection("users")
        .findOneAndUpdate(
          { _id: new ObjectId(sender._id) },
          { $set: { account: sender.account } },
        );
    } else {
      if (!receiver?.account) {
        console.log("createTransaction: receiver not found");
        return null;
      }

      const receiverTransactions = Array.isArray(receiver.account.transactions)
        ? receiver.account.transactions
        : [];

      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: transaction.sender?.account?.data?.accountNumber,
        receiver: transaction.receiver?.account?.data?.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Debit",
      };

      receiverTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        sender: transaction.sender?.account?.data?.accountNumber,
        receiver: transaction.receiver?.account?.data?.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Credit",
      };

      senderTransactions.push(senderTransaction);
      receiverTransactions.push(receiverTransaction);

      sender.account.transactions = senderTransactions;
      receiver.account.transactions = receiverTransactions;

      await db
        .collection("users")
        .findOneAndUpdate(
          { _id: new ObjectId(sender._id) },
          { $set: { account: sender.account } },
        );
      await db
        .collection("users")
        .findOneAndUpdate(
          { _id: new ObjectId(receiver._id) },
          { $set: { account: receiver.account } },
        );
    }

    const transactions = {
      sender: senderTransaction,
      receiver: receiverTransaction,
    };
    return parseStringify(transactions);
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
  const users = db.collection<User>("users");

  try {
    const user = await users.findOne({
      _id: new ObjectId(accountId),
    });

    if (!user?.account?.transactions) return [];
    return parseStringify(user.account.transactions);
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
        user?.account?.data?.accountNumber ===
        transferParams.sender?.data?.accountNumber,
    );
    const receiver = users.find(
      (user) =>
        user?.account?.data?.accountNumber ===
        transferParams.receiver?.data?.accountNumber,
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

    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(sender._id) },
        { $set: { account: transferParams.sender } },
      );
    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(receiver._id) },
        { $set: { account: transferParams.receiver } },
      );

    const transfer = {
      sender,
      receiver,
    };
    return parseStringify(transfer);
  } catch (error) {
    console.log("createTransfer error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const addToBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    const users = await db.collection("users").find({}).toArray();
    const user = users.find((u) => u?.email === email);

    if (!user?.account?.data) {
      console.log("addToBalance: user or account not found for", email);
      return null;
    }

    user.account.data.currentBalance =
      Number(user.account.data.currentBalance) + Number(amount);
    user.account.deposit = "";

    await db
      .collection("users")
      .findOneAndUpdate({ email }, { $set: { account: user.account } });

    return parseStringify(user);
  } catch (error) {
    console.log("addToBalance error:", error);
    return null;
  } finally {
    await client.close();
  }
};

export const subtractFromBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");

  try {
    const users = await db.collection("users").find({}).toArray();
    const user = users.find((u) => u?.email === email);

    if (!user?.account?.data) {
      console.log("subtractFromBalance: user or account not found for", email);
      return null;
    }

    const currentBalance = Number(user.account.data.currentBalance);
    const withdrawAmount = Number(amount);

    if (withdrawAmount > currentBalance) {
      console.log("subtractFromBalance: insufficient funds");
      return null;
    }

    user.account.data.currentBalance = currentBalance - withdrawAmount;

    // Ensure transactions is always an array — do not wipe existing ones
    if (!Array.isArray(user.account.transactions)) {
      user.account.transactions = [];
    }

    await db
      .collection("users")
      .findOneAndUpdate({ email }, { $set: { account: user.account } });

    return parseStringify(user);
  } catch (error) {
    console.log("subtractFromBalance error:", error);
    return null;
  } finally {
    await client.close();
  }
};
