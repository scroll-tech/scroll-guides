import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-dependency-compiler";

require("dotenv").config();
const {
  RPC_SCROLL,
  PRIVATE_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "london"
    }
  },
  networks: {
    scroll: {
      url: RPC_SCROLL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  defaultNetwork: "scroll",
  dependencyCompiler: {
    paths: [
      "@scroll-tech/contracts/L2/predeploys/IL1GasPriceOracle.sol"
    ]
  }
};

export default config;
