"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";
import { MongoClient, ObjectId } from "mongodb";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (transaction: CreateTransactionProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection('users').find({}).toArray()
  try {
    const sender = users.find(user => user?.account === transaction.sender.account)
    const receiver = users.find(user => user?.account === transaction.receiver.account)
    const senderTransactions = sender!.account.transactions
    const receiverTransactions = receiver!.account.transactions

    const senderTransaction = {
      description: transaction.description,
      amount: transaction.amount,
      status: "Processed",
      sender: transaction.sender,
      receiver: transaction.receiver,
      email: transaction.email,
      createdAt: new Date(),
      category: "Debit"
    };

    const receiverTransaction = {
      description: transaction.description,
      amount: transaction.amount,
      status: "Processed",
      sender: transaction.sender,
      receiver: transaction.receiver,
      email: transaction.email,
      createdAt: new Date(),
      category: "Credit"
    };

    senderTransactions.push(senderTransaction)
    receiverTransactions.push(receiverTransaction)

    sender!.account.transactions = senderTransactions
    receiver!.account.transactions = receiverTransactions



    await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(sender?._id!) },
      { $set: { account: sender!.account } },
    );
    await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(receiver?._id!) },
      { $set: { account: receiver!.account } },
    );
    const transactions = {
      sender : senderTransaction,
      receiver: receiverTransactions
    }
    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const getTransactionsByAccountId = async ({accountId}: getTransactionsByAccountIdProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  try {
    const user = await users.findOne({
      _id: new ObjectId(accountId),
    });
    const transactions = user!.account!.transactions
    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const createTransfer = async ({
  ...transferParams
}: TransferParams) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection('users').find({}).toArray()
  try {
    const sender = users.find(user => user?.account === transferParams.sender)
    const receiver = users.find(user => user?.account === transferParams.receiver)
    transferParams.sender.data.currentBalance = transferParams.sender.data.currentBalance - Number(transferParams.amount)
    transferParams.receiver.data.currentBalance = transferParams.receiver.data.currentBalance + Number(transferParams.amount)

    await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(sender?._id!) },
      { $set: { account: transferParams.sender } },
    );
    await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(receiver?._id!) },
      { $set: { account: transferParams.receiver } },
    );
    const transfer = {
      sender : sender,
      receiver: receiver
    }
    return parseStringify(transfer);
  } catch (error) {
    console.log(error);
    return null;
  }
};