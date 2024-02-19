import { ethers } from "ethers";
import { Wallet } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export function getEnv(key: string) {
  if (!process.env[key]) throw new Error(`⛔️ ${key} not found in .env file!`);
  return process.env[key] as string;
}

export const getProvider = () => {
  const { SCROLL_TESTNET_URL } = process.env;
  if (!SCROLL_TESTNET_URL)
    throw new Error("⛔️ SCROLL_TESTNET_URL not found in .env file!");
  return new ethers.providers.JsonRpcProvider(SCROLL_TESTNET_URL);
};

export const getWallet = (privateKey?: string) => {
  let PK = privateKey;
  if (!PK) {
    PK = getEnv("PRIVATE_KEY");
  }

  const provider = getProvider();

  // Initialize ethers Wallet
  const newWallet = new Wallet(PK, provider);

  return newWallet;
};
