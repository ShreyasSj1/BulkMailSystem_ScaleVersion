import UnsubscribedUser from "../models/unsubscribedUserModel.js";

export const filterUnsubscribedRecipients = async (emails) => {
  const unsubscribedUsers = await UnsubscribedUser.find(
    {
      email: { $in: emails }
    },
    { email: 1, _id: 0 }
  ).lean();

  const unsubscribedSet = new Set(unsubscribedUsers.map((user) => user.email));
  const allowedRecipients = emails.filter((email) => !unsubscribedSet.has(email));

  return {
    allowedRecipients,
    skippedUnsubscribed: Array.from(unsubscribedSet)
  };
};
