import { Client, Databases, Query, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "");

export const databases = new Databases(client);
export const storage = new Storage(client);
export { Query };
export const DB_ID = process.env.NEXT_PUBLIC_DB_ID || "luxury_db";
export const COL_ID = process.env.NEXT_PUBLIC_COL_ID || "products";
