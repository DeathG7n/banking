"use server";

import { parseStringify } from "../utils";
import { MongoClient, ObjectId } from "mongodb";

export const createTransaction = async (
  transaction: CreateTransactionProps,
) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const sender = users.find(
      (user) =>
        user?.account.data.accountNumber ===
        transaction!.sender?.account?.data.accountNumber,
    );
    const receiver = users.find(
      (user) =>
        user?.account.data.accountNumber ===
        transaction!.receiver?.account?.data.accountNumber,
    );
    const senderTransactions = sender!.account.transactions;
    const receiverTransactions = receiver!.account.transactions;

    let senderTransaction;
    let receiverTransaction;

    if (transaction.description === "Withdraw") {
      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: "Processed",
        sender: transaction.sender?.account?.data.accountNumber,
        receiver: transaction.receiver?.account?.data.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Credit",
      };

      receiverTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: "Processed",
        sender: transaction.sender?.account?.data.accountNumber,
        receiver: transaction.receiver?.account?.data.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Debit",
      };
    } else {
      senderTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: "Processed",
        sender: transaction.sender?.account?.data.accountNumber,
        receiver: transaction.receiver?.account?.data.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Debit",
      };

      receiverTransaction = {
        description: transaction.description,
        amount: transaction.amount,
        status: "Processed",
        sender: transaction.sender?.account?.data.accountNumber,
        receiver: transaction.receiver?.account?.data.accountNumber,
        email: transaction.email,
        createdAt: new Date(),
        category: "Credit",
      };
    }

    senderTransactions.push(senderTransaction);
    receiverTransactions.push(receiverTransaction);

    sender!.account.transactions = senderTransactions;
    receiver!.account.transactions = receiverTransactions;

    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(sender?._id!) },
        { $set: { account: sender!.account } },
      );
    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(receiver?._id!) },
        { $set: { account: receiver!.account } },
      );
    const transactions = {
      sender: senderTransaction,
      receiver: receiverTransaction,
    };
    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTransactionsByAccountId = async ({
  accountId,
}: getTransactionsByAccountIdProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  try {
    const user = await users.findOne({
      _id: new ObjectId(accountId),
    });
    const transactions = user!.account!.transactions;
    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createTransfer = async ({ ...transferParams }: TransferParams) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const sender = users.find(
      (user) =>
        user?.account.data.accountNumber ===
        transferParams.sender.data.accountNumber,
    );
    const receiver = users.find(
      (user) =>
        user?.account.data.accountNumber ===
        transferParams.receiver.data.accountNumber,
    );
    transferParams.sender.data.currentBalance =
      transferParams.sender.data.currentBalance - Number(transferParams.amount);
    transferParams.receiver.data.currentBalance =
      transferParams.receiver.data.currentBalance +
      Number(transferParams.amount);

    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(sender?._id!) },
        { $set: { account: transferParams.sender } },
      );
    await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(receiver?._id!) },
        { $set: { account: transferParams.receiver } },
      );
    const transfer = {
      sender: sender,
      receiver: receiver,
    };
    return parseStringify(transfer);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const addToBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const user = users.find((user) => user?.email === email);
    user!.account.data.currentBalance =
      Number(user!.account.data.currentBalance) - Number(amount);
    user!.account.deposit = "";

    await db
      .collection("users")
      .findOneAndUpdate({ email: email }, { $set: { account: user?.account } });

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const subtractFromBalance = async ({ amount, email }: any) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const user = users.find((user) => user?.email === email);
    user!.account.data.currentBalance =
      Number(user!.account.data.currentBalance) - Number(amount);
    await db
      .collection("users")
      .findOneAndUpdate({ email: email }, { $set: { account: user?.account } });

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
};
