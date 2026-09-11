import { clerkClient } from "@clerk/express";
import User from "../models/userSchema.js";

const getEmail = (clerkUser) =>
  clerkUser.emailAddresses?.[0]?.emailAddress ||
  clerkUser.email_addresses?.[0]?.email_address ||
  null;

export const upsertClerkUser = async (clerkUser) => {
  const email = getEmail(clerkUser);

  if (!email) {
    throw new Error("Clerk user has no email address");
  }

  return await User.findOneAndUpdate(
    { clerkId: clerkUser.id },

    {
      clerkId: clerkUser.id,
      firstName: clerkUser.firstName || clerkUser.first_name || "",
      lastName: clerkUser.lastName || clerkUser.last_name || "",
      username: clerkUser.username || null,
      email,
      image: clerkUser.imageUrl || clerkUser.image_url || "",
    },

    // create new user
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

export const syncClerkUserById = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  return upsertClerkUser(clerkUser);
};
