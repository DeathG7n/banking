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
  try {
    const { database } = await createAdminClient();

    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: 'online',
        category: 'Transfer',
        ...transaction
      }
    )

    return parseStringify(newTransaction);
  } catch (error) {
    console.log(error);
  }
}

export const getTransactionsByBankId = async ({bankId}: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('senderBankId', bankId)],
    )

    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('receiverBankId', bankId)],
    );

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.documents, 
        ...receiverTransactions.documents,
      ]
    }

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
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