import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ExampleContractFactory } from "../typechain-types";

const deployExampleContractFactoryFixture = async () => {
  const contractDeployer = await ethers.getContractFactory("ExampleContractFactory");
  const [owner] = await ethers.getSigners();

  const exampleContractFactory = await contractDeployer.deploy();

  return {
    exampleContractFactory,
    owner
  }
}

describe("ExampleContractFactory unit", () => {
  let exampleContractFactory: ExampleContractFactory;
  let owner: SignerWithAddress;

  beforeEach(async () => {
    const fixture = await loadFixture(deployExampleContractFactoryFixture)

    exampleContractFactory = fixture.exampleContractFactory;
    owner = fixture.owner;
  })

  describe("Deterministic deployment", () => {
    it("should calculate the create2 address properly", async () => {
      const expectedAddress = "0x1B18ad7eb64Eecc0428B88ca596A5fa9EedF1e7e";

      const exampleContractBytecode = await exampleContractFactory.getBytecode(1);
      const calculatedAddress = await exampleContractFactory.getAddress(exampleContractBytecode, 1);

      expect(calculatedAddress).to.equal(expectedAddress);
    })

    it("should deploy on address same as the pre-calculated one", async () => {
      const exampleContractBytecode = await exampleContractFactory.getBytecode(1)
      const expectedAddress = await exampleContractFactory.getAddress(exampleContractBytecode, 1)

      await expect(exampleContractFactory.deployDeterministically(1,1))
        .to.emit(exampleContractFactory, "DeterministicContractDeployed")
        .withArgs(expectedAddress);
    })
  })
});
