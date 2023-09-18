import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const {
  RPC_SCROLL,
  RPC_ETHEREUM_SEPOLIA,
  RPC_POLYGON,
  PRIVATE_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    scroll: {
      url: RPC_SCROLL,
      accounts: [ PRIVATE_KEY || "1".repeat(64) ]
    },
    sepolia: {
      url: RPC_ETHEREUM_SEPOLIA,
      accounts: [ PRIVATE_KEY || "1".repeat(64) ]
    }
  }
};

export default config;
