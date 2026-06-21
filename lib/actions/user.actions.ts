"use server";

import { cookies } from "next/headers";
import { parseStringify } from "../utils";
import { MongoClient, ObjectId } from "mongodb";
import { createAccountNumber } from "./bank.actions";

export const signIn = async ({ email, password }: signInProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");

  try {
    const user = await users.findOne({
      email: email,
    });

    if (!user) {
      throw new Error("User doesn't exists");
    } else {
      if (user?.password !== password) {
        throw new Error("Wrong Password");
      } else {
        cookies().set("user-id", user._id.toString(), {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });
        return parseStringify(user);
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
};

export const signUp = async (userData: SignUpParams) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");

  try {
    const existingUser = await users.findOne({
      email: userData.email,
    });

    if (!existingUser) {
      throw new Error("User not found");
    }
    userData.account.data.currentBalance = existingUser.amount ?? 0
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newUser = await users.insertOne(user);
    if (newUser) {
      await users.deleteOne({
        _id: new ObjectId(existingUser?._id)
      });
    }

    cookies().set("user-email", userData.email, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
};
export const createUser = async (userData: CreateUser) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");

  try {
    const existingUser = await users.findOne({
      email: userData.email,
    });

    if (existingUser) {
      throw new Error("User already exists");
    }
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newUser = await users.insertOne(user);

    return parseStringify(newUser);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
};

export async function getLoggedInUser() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = db.collection<User>("users");
  const id = cookies().get("user-id");
  try {
    const user = await users.findOne({
      _id: new ObjectId(id!.value),
    });

    if (user!.account!.data!.accountNumber === 0) {
      await createAccountNumber();
    }

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    cookies().delete("user-id");
    return "Account Logged Out";
  } catch (error) {
    return null;
  }
};

export async function getActiveAccounts() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    let accounts = [];
    for (let i = 0; i < users.length; i++) {
      const account = users[i].account;
      accounts.push(String(account.data.accountNumber));
    }
    return parseStringify(accounts);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const getAccountById = async ({ accountId }: getAccountByIdProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const user = users.find(
      (user) => user?.account?.data?.accountNumber === Number(accountId),
    );
    return parseStringify(user!.account);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUsers = async () => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    return parseStringify(users);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserByEmail = async ({ accountId }: getAccountByIdProps) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db("banking");
  const users = await db.collection("users").find({}).toArray();
  try {
    const user = users.find(
      (user) => user?.account?.data?.accountNumber === Number(accountId),
    );
    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
};
