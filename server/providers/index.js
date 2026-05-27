import { GmailProvider } from "./GmailProvider.js";

let providerInstance;

export const getEmailProvider = () => {
  if (!providerInstance) {
    providerInstance = new GmailProvider();
  }

  return providerInstance;
};
