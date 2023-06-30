import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();
const {
  RPC_SCROLL,
  RPC_ETHEREUM_GOERLI,
  RPC_POLYGON,
  PRIVATE_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    scroll: {
      url: RPC_SCROLL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    goerli: {
      url: RPC_ETHEREUM_GOERLI,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    polygon: {
      url: RPC_POLYGON,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

export default config;
