import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const GreeterOperator = await ethers.getContractFactory("GreeterOperator");
  const greeterOperator = await GreeterOperator.deploy();

  await greeterOperator.deployed();

  console.log(
    `GreeterOperator contract deployed to ${greeterOperator.address}`
  );

  // Check if .env file exists before writing to it
  try {
    fs.accessSync(".env", fs.constants.F_OK);
    // Append deployed address to dotenv file
    fs.appendFileSync(
      ".env",
      `\nGREETER_OPERATOR_CONTRACT_ADDRESS=${greeterOperator.address}`
    );
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // .env file does not exist, create it and write the address
      fs.writeFileSync(
        ".env",
        `GREETER_OPERATOR_CONTRACT_ADDRESS=${greeterOperator.address}\n`
      );
    } else {
      throw err;
    }
  }

  // Log gas fee for deployment
  const txReceipt = await greeterOperator.deployTransaction.wait();
  const gasUsed = txReceipt.gasUsed.toNumber();
  const gasPrice = (await ethers.provider.getGasPrice()).toNumber(); // Get gas price in wei
  const gasFee = gasUsed * gasPrice; // Calculate gas fee in wei
  const gasFeeEth = ethers.utils.formatEther(gasFee.toString()); // Convert gas fee to ETH

  console.log(`Gas fee for deployment: ${gasFeeEth} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
