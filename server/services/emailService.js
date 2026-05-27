import { getEmailProvider } from "../providers/index.js";

export const sendEmail = async (payload) => {
  const provider = getEmailProvider();
  return provider.sendEmail(payload);
};
