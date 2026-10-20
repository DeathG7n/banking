"use server";

import {
  parseStringify,
  generateCardNumber,
  generateCVV,
  generateExpiryDate,
  generateOTP,
} from "../utils";

import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

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
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user) return null;

    const str = String(user._id);
    const accountNumber = str.replace(/\D/g, "").slice(0, 10);

    const account = user.account;
    if (!account) return null;

    account.data.accountNumber = Number(accountNumber);

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
      { $set: { account: account } },
    );

    return parseStringify(accountNumber);
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.close();
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
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user) return null;
    if (user.account?.hasCard) return null;

    const cardNumber = generateCardNumber(cardData.type);
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    const account = user.account;
    if (!account) return null;

    account.hasCard = true;
    account.card.type = cardData.type;
    account.card.expiryDate = expiryDate;
    account.card.cvv = Number(cvv);
    account.card.cardNumber = Number(cardNumber);
    account.card.mask = cardNumber.slice(-4);

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
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
  } finally {
    await client.close();
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
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user?.account) return null;

    const account = user.account;
    account.deposit = depositData.confirmation;

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
      { $set: { account: account } },
    );

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.close();
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
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user?.account) return null;

    const account = user.account;
    if (!account.withdraw) {
      account.withdraw = [];
    }

    account.withdraw.push(withdrawData);

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
      { $set: { account: account } },
    );

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.close();
  }
}

export async function createOTP() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");

  const id = cookies().get("user-id");
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user) return null;

    const otp = {
      code: generateOTP(),
      createdAt: new Date(),
    };

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
      { $set: { otp } },
    );

    // FIX: send OTP to the actual user, not EMAIL_RECEIVER
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "OTP Verification",
      html: `<h2>Your OTP is: <strong>${otp.code}</strong></h2>
             <p>This code expires in 10 minutes.</p>`,
    });

    // Return updated user so the client can refresh state
    return parseStringify({ ...user, otp });
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.close();
  }
}

export async function deleteOTP() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");

  const id = cookies().get("user-id");
  if (!id?.value) {
    await client.close();
    return null;
  }

  try {
    const user = await users.findOne({
      _id: new ObjectId(id.value),
    });

    if (!user) return null;

    const otp = {
      code: 0,
      createdAt: new Date(),
    };

    await users.findOneAndUpdate(
      { _id: new ObjectId(id.value) },
      { $set: { otp } },
    );

    return parseStringify({ ...user, otp });
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await client.close();
  }
}