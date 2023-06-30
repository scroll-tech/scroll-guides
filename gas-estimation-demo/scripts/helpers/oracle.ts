import { ethers } from "hardhat";
import { ContractTransaction } from "ethers";

export async function estimateL1Fee(gasOraclePrecompileAddress: string, unsignedSerializedTransaction: string): Promise<bigint> {
  const l1GasOracle = await ethers.getContractAt("IL1GasPriceOracle", gasOraclePrecompileAddress);

  return l1GasOracle.getL1Fee(unsignedSerializedTransaction);
}

export async function estimateL2Fee(tx: ContractTransaction): Promise<bigint> {
  const gasToUse = await ethers.provider.estimateGas(tx);
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  if (!gasPrice) {
    throw new Error("There was an error estimating L2 fee");
  }

  return gasToUse * gasPrice;
}