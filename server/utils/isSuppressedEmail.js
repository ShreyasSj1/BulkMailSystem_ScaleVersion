import SuppressionList from "../models/suppressionListModel.js";

export const isSuppressedEmail = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const suppressed = await SuppressionList.exists({ email: normalizedEmail });
  return Boolean(suppressed);
};
