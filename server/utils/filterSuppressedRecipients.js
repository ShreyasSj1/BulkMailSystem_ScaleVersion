import SuppressionList from "../models/suppressionListModel.js";

export const filterSuppressedRecipients = async (emails) => {
  const suppressedUsers = await SuppressionList.find(
    { email: { $in: emails } },
    { email: 1, _id: 0 }
  ).lean();

  const suppressedSet = new Set(suppressedUsers.map((item) => item.email));
  const allowedRecipients = emails.filter((email) => !suppressedSet.has(email));

  return {
    allowedRecipients,
    skippedSuppressed: Array.from(suppressedSet)
  };
};
