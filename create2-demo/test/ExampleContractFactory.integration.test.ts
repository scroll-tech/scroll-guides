import { ethers } from "hardhat";
import { expect } from "chai";
require("dotenv").config();

const {
  RPC_SCROLL,
  RPC_ETHEREUM_SEPOLIA,
  FACTORY_CONTRACT_ADDRESS_SCROLL,
  FACTORY_CONTRACT_ADDRESS_ETHEREUM_SEPOLIA,
} = process.env;

if (
  !RPC_SCROLL ||
  !RPC_ETHEREUM_SEPOLIA ||
  !FACTORY_CONTRACT_ADDRESS_SCROLL ||
  !FACTORY_CONTRACT_ADDRESS_ETHEREUM_SEPOLIA
) {
  throw new Error("Please fill the .env fully");
}

const getDeterministicAddress = async (providerRpc: string, contractAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(providerRpc);

  const ExampleContractFactory = await ethers.getContractFactory("ExampleContractFactory");
  const contract = await ExampleContractFactory.attach(contractAddress);

  const exampleParam = 1;
  const exampleSalt = 1;

  return await contract.connect(provider).callStatic.deployDeterministically(exampleParam, exampleSalt);
}

const exampleContractFactoryFixture = async () => {
  const scrollDeterministicAddressResult = await getDeterministicAddress(RPC_SCROLL, FACTORY_CONTRACT_ADDRESS_SCROLL);
  const ethereumSepoliaDeterministicAddressResult = await getDeterministicAddress(RPC_ETHEREUM_SEPOLIA, FACTORY_CONTRACT_ADDRESS_ETHEREUM_SEPOLIA);
  

  return {
    scrollDeterministicAddressResult,
    ethereumSepoliaDeterministicAddressResult,
    
  }
}

describe("ExampleContractFactory integration", () => {
  let scrollDeterministicAddressResult: string;
  let ethereumSepoliaDeterministicAddressResult: string;


  beforeEach(async () => {
    const fixture = await exampleContractFactoryFixture();

    scrollDeterministicAddressResult = fixture.scrollDeterministicAddressResult;
    ethereumSepoliaDeterministicAddressResult = fixture.ethereumSepoliaDeterministicAddressResult;

  });

  describe("EVM compatible networks should have same calculated address as Ethereum", async () => {
    it("should have the same address on Scroll", () => {
      expect(scrollDeterministicAddressResult).to.be.equal(ethereumSepoliaDeterministicAddressResult);
    });

  
  })
});
