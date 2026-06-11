"use server";

import {
  parseStringify,
  generateCardNumber,
  generateCVV,
  generateExpiryDate,
} from "../utils";

import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";

export async function createAccountNumber() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  const id = cookies().get("user-id");
  try {
    const user = await users.findOne({
      _id: new ObjectId(id!.value),
    });
    const str = String(user!._id);
    const accountNumber = str.replace(/\D/g, "").slice(0, 10);

    const account = user!.account;
    account!.data.accountNumber = Number(accountNumber);

    await users.findOneAndUpdate(
      { _id: new ObjectId(id!.value) },
      { $set: { account: account } },
    );

    return parseStringify(accountNumber);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createCard(cardData: CreateCardParams) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  const id = cookies().get("user-id");
  try {
    const user = await users.findOne({
      _id: new ObjectId(id!.value),
    });

    if (user!.account?.hasCard) return;

    const cardNumber = generateCardNumber(cardData.type);
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();
    console.log(cardNumber);

    const account = user!.account;
    account!.hasCard = true;
    account!.card.type = cardData.type;
    account!.card.expiryDate = expiryDate;
    account!.card.cvv = Number(cvv);
    account!.card.cardNumber = Number(cardNumber);
    account!.card.mask = cardNumber.slice(-4);

    await users.findOneAndUpdate(
      { _id: new ObjectId(id!.value) },
      {
        $set: {
          avatar: cardData.avatar,
          account: account,
          identification: cardData.identification,
        },
      },
    );

    return parseStringify(cardNumber);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createDeposit(depositData: DepositParams) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  const id = cookies().get("user-id");
  try {
    const user = await users.findOne({
      _id: new ObjectId(id!.value),
    });

    const account = user!.account;
    account!.deposit = depositData.confirmation

    await users.findOneAndUpdate(
      { _id: new ObjectId(id!.value) },
      {
        $set: {
          account: account,
        },
      },
    );

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}


export async function createWithdraw(withdrawData: WithDrawParams) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  const id = cookies().get("user-id");
  try {
    const user = await users.findOne({
      _id: new ObjectId(id!.value),
    });

    const account = user!.account;
    
    account!.withdraw = withdrawData

    await users.findOneAndUpdate(
      { _id: new ObjectId(id!.value) },
      {
        $set: {
          account: account,
        },
      },
    );

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}
