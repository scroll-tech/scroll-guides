import { ethers } from "hardhat";


async function main() {
  
  const contractDeployer = await ethers.getContractFactory("ExampleContractFactory");
  const contractdeployed = await contractDeployer.deploy()

  const exampleParam = 1
  const salt = 1

  const exampleContractBytecode = await contractdeployed.getBytecode(exampleParam);
  console.log(exampleContractBytecode)
  
  const contractAddress = await contractdeployed.getAddress(exampleContractBytecode, salt);
  console.log(contractAddress)
  
  const contract = await contractDeployer.attach(contractAddress)

  const deploy = await contract.deployDeterministically(exampleParam,salt)

  console.log("Factory deployed to:", deploy);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
