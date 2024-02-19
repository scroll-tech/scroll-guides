import * as hre from "hardhat";
import { getEnv } from "../utils";
import { ethers } from "ethers";
import { providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL as string;

// Address of the contract to interact with
const GREERTER_CONTRACT_ADDRESS = getEnv("GREETER_CONTRACT_ADDRESS");
console.log(`Contract address: ${GREERTER_CONTRACT_ADDRESS}`);

async function main() {
  // Get the greeting message
  const greeterArtifact = await hre.artifacts.readArtifact("Greeter");
  const newGreeterArtifact = new ethers.Contract(
    GREERTER_CONTRACT_ADDRESS,
    greeterArtifact.abi,
    new providers.JsonRpcProvider(ETHEREUM_RPC_URL)
  );
  const testGreet = await newGreeterArtifact.greeting();
  console.log("testGreet", testGreet);
  console.log("Done!");
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
