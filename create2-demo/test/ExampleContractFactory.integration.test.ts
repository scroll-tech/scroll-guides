import { ethers } from "hardhat";
import { expect } from "chai";
require("dotenv").config();

const {
  RPC_SCROLL,
  RPC_ETHEREUM_GOERLI,
  RPC_POLYGON,
  FACTORY_CONTRACT_ADDRESS_SCROLL,
  FACTORY_CONTRACT_ADDRESS_ETHEREUM_GOERLI,
  FACTORY_CONTRACT_ADDRESS_POLYGON
} = process.env;

if (
  !RPC_SCROLL || !RPC_ETHEREUM_GOERLI || !RPC_POLYGON ||
  !FACTORY_CONTRACT_ADDRESS_SCROLL || !FACTORY_CONTRACT_ADDRESS_ETHEREUM_GOERLI || !FACTORY_CONTRACT_ADDRESS_POLYGON
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
  const ethereumGoerliDeterministicAddressResult = await getDeterministicAddress(RPC_ETHEREUM_GOERLI, FACTORY_CONTRACT_ADDRESS_ETHEREUM_GOERLI);
  const polygonDeterministicAddressResult = await getDeterministicAddress(RPC_POLYGON, FACTORY_CONTRACT_ADDRESS_POLYGON);

  return {
    scrollDeterministicAddressResult,
    ethereumGoerliDeterministicAddressResult,
    polygonDeterministicAddressResult
  }
}

describe("ExampleContractFactory integration", () => {
  let scrollDeterministicAddressResult: string;
  let ethereumGoerliDeterministicAddressResult: string;
  let polygonDeterministicAddressResult: string;

  beforeEach(async () => {
    const fixture = await exampleContractFactoryFixture();

    scrollDeterministicAddressResult = fixture.scrollDeterministicAddressResult;
    ethereumGoerliDeterministicAddressResult = fixture.ethereumGoerliDeterministicAddressResult;
    polygonDeterministicAddressResult = fixture.polygonDeterministicAddressResult;
  });

  describe("EVM compatible networks should have same calculated address as Ethereum", async () => {
    it("should have the same address on Scroll", () => {
      expect(scrollDeterministicAddressResult).to.be.equal(ethereumGoerliDeterministicAddressResult);
    });

    it("should have the same address on Polygon", () => {
      expect(polygonDeterministicAddressResult).to.be.equal(ethereumGoerliDeterministicAddressResult);
    })
  })
});
