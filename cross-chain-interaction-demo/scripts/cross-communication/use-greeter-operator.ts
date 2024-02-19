import * as hre from "hardhat";
import { getEnv, getWallet } from "../utils";
import { ethers } from "ethers";
import { providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL as string;

// Address of the contract to interact with
const CONTRACT_ADDRESS = getEnv("GREETER_OPERATOR_CONTRACT_ADDRESS");
const GREERTER_CONTRACT_ADDRESS = getEnv("GREETER_CONTRACT_ADDRESS");
console.log(`Contract address: ${CONTRACT_ADDRESS}`);

async function main() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact("GreeterOperator");

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet()
  );

  // Execute greeter function
  console.log("Executing greeter function...");
  const greeter = await contract.executeFunctionCrosschain(
    "0xba50f5340fb9f3bd074bd638c9be13ecb36e603d",
    GREERTER_CONTRACT_ADDRESS,
    0,
    "This message was cross-chain!",
    0
  );
  await greeter.wait();

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
