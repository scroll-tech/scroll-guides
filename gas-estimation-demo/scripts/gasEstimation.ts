import { ethers } from "hardhat";

import dotenv from "dotenv";
import {
  getSerializedTransaction,
  buildUnsignedTransaction,
  buildPopulatedExampleContractTransaction
} from "./helpers/transactions";
import { estimateL1Fee, estimateL2Fee } from "./helpers/oracle";
import { getPercentageDifference, getRandomInt } from "./helpers/utils";
import { ContractTransaction } from "ethers";

dotenv.config();

const {
  EXAMPLE_CONTRACT_ADDRESS,
  ORACLE_PRECOMPILE_ADDRESS
} = process.env;

async function getEstimatedFees(gasOracleAddress: string, populatedTransaction: ContractTransaction, serializedTransaction: string) {
  const estimatedL1Fee = await estimateL1Fee(gasOracleAddress, serializedTransaction);
  const estimatedL2Fee = await estimateL2Fee(populatedTransaction);
  const estimatedTotalFee = estimatedL1Fee + estimatedL2Fee;

  return {
    estimatedL1Fee,
    estimatedL2Fee,
    estimatedTotalFee
  }
}

async function main() {
  if (!EXAMPLE_CONTRACT_ADDRESS || !ORACLE_PRECOMPILE_ADDRESS) {
    throw new Error("Please fill the .env file with all values");
  }

  const { getSigners } = ethers;
  const [ signer ] = await getSigners();
  const signerAddress = await signer.getAddress()

  const newValueToSetOnExampleContract = getRandomInt(100);

  // Building the transaction and getting the estimated fees
  const populatedTransaction = await buildPopulatedExampleContractTransaction(EXAMPLE_CONTRACT_ADDRESS, newValueToSetOnExampleContract);
  const unsignedTransaction = await buildUnsignedTransaction(signer, populatedTransaction);
  const serializedTransaction = getSerializedTransaction(unsignedTransaction);
  const estimatedFees = await getEstimatedFees(ORACLE_PRECOMPILE_ADDRESS, populatedTransaction, serializedTransaction);

  console.log("Estimated L1 fee (wei):", estimatedFees.estimatedL1Fee.toString());
  console.log("Estimated L2 fee (wei):", estimatedFees.estimatedL2Fee.toString());
  console.log("Estimated total fee (wei): ", estimatedFees.estimatedTotalFee.toString());
  console.log("\n");

  // Executing the transaction on-chain and verifying actual values
  const signerBalanceBefore = await ethers.provider.getBalance(signerAddress);
  const exampleContract = await ethers.getContractAt("ExampleContract", EXAMPLE_CONTRACT_ADDRESS, signer);
  const tx = await exampleContract.setExampleVariable(newValueToSetOnExampleContract);
  const txReceipt = await tx.wait(5);
  const signerBalanceAfter = await ethers.provider.getBalance(signerAddress);

  if (!txReceipt) {
    throw new Error("Failed fetching the tx receipt, please try running the script again");
  }

  const totalFee = signerBalanceBefore - signerBalanceAfter;
  const l2Fee = txReceipt.gasUsed * txReceipt.gasPrice;
  const l1Fee = totalFee - l2Fee;

  console.log("Actual L1 fee (wei):", l1Fee.toString());
  console.log("Actual L2 fee (wei):", l2Fee.toString());
  console.log("Actual total fee (wei): ", totalFee.toString());

  console.log("\n");

  console.log("(actual fee - estimated fee)");
  console.log(`Difference L1 fee (wei): ${l1Fee - estimatedFees.estimatedL1Fee} (${getPercentageDifference(l1Fee, estimatedFees.estimatedL1Fee)}%)`);
  console.log(`Difference L2 fee (wei): ${l2Fee - estimatedFees.estimatedL2Fee} (${getPercentageDifference(l2Fee, estimatedFees.estimatedL2Fee)}%)`);
  console.log(`Difference total fee (wei): ${totalFee - estimatedFees.estimatedTotalFee} (${getPercentageDifference(totalFee, estimatedFees.estimatedTotalFee)}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});