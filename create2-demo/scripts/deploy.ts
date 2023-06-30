import { ethers } from "hardhat";

async function main() {
  const contractDeployer = await ethers.getContractFactory("ExampleContractFactory");
  const exampleContractFactory = await contractDeployer.deploy();

  await exampleContractFactory.deployed();

  console.log("Factory deployed to:", exampleContractFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
