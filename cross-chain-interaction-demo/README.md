<img src="../assets/banner.png" alt="create2-banner" />

## Prerequisites

- Network setup: [Network configuration](https://docs.scroll.io/en/developers/developer-quickstart/#network-configuration)

In this example, we will launch a dummy smart contract on either Sepolia or Scroll and interact
with it from the opposite chain. We will be using the `ScrollMessenger` that is deployed on both
Sepolia and Scroll.

# Scroll Messenger Cross-chain Interaction Tutorial

This tutorial shows you how to build cross-chain interaction between Layer 1 (L1) and Layer 2 (L2) on scroll. You will:

- Create a greeter and greeterOperator contract
- Deploy the greeter on L1 sepolia Testnet and greeterOperator on L2 scroll sepolia (you can choose to do it the other way round, it is the same approach.)
- communicate with the greeter contract from L2 scroll sepolia testnet (or L1 if you choose to deploy greeter on L2)
- Relay message when sending from L2 to L1 or L1 to L2

### Target Smart Contract

Let’s start by creating a new scroll project. We will use the Greeter contract for this
example, but you can use any other contract.

## Setup the Project

1.  Initiate a new project by running the command:

```sh
git clone https://github.com/scroll-tech/scroll-guides.git
cd scroll-guides/cross-chain-interaction-demo
yarn install
```

Check the .env.example for sample of what to put in your .env.

Make sure the deployer wallet address (EOA) that you will use for the deployment has sepolia testnet and scroll sepolia test, you can check [here](https://docs.scroll.io/en/developers/developer-quickstart/) on how to bridge some sepolia to scroll sepolia testnet.

This creates a new scroll cross-chain interaction project called `cross-chain-interaction-demo` with a basic `Greeter` and `GreeterOperator` contract, and install all the necessary dependencies.

2. Navigate into the contracts directory:

   - There are two smart contract there

   1. Greeter.sol
   2. Greeteroperator.sol

The Greeter contract looks like this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// This Greeter contract will be interacted with through the ScrollMessenger across the bridge
contract Greeter {
  string public greeting = "Hello World!";

  // This function will be called by executeFunctionCrosschain on the Operator Smart Contract
  function setGreeting(string memory greeting_) public {
    greeting = greeting_;
  }
}
```

The GreeterOperator contract looks:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// The Scroll Messenger interface is the same on both L1 and L2, it allows sending cross-chain transactions

// Let's import it directly from the Scroll Contracts library
import "@scroll-tech/contracts@0.1.0/libraries/IScrollMessenger.sol";

// The GreeterOperator is capable of executing the Greeter function through the bridge

contract GreeterOperator {
  // This function will execute setGreeting on the Greeter contract
  function executeFunctionCrosschain(
    address scrollMessengerAddress,
    address targetAddress,
    uint256 value,
    string memory greeting,
    uint32 gasLimit
  ) public payable {
    IScrollMessenger scrollMessenger = IScrollMessenger(scrollMessengerAddress);

    // sendMessage is able to execute any function by encoding the abi using the encodeWithSignature function
    scrollMessenger.sendMessage{ value: msg.value }(
      targetAddress,
      value,
      abi.encodeWithSignature("setGreeting(string)", greeting),
      gasLimit,
      msg.sender
    );
  }
}
```

Now: change directory to scripts to access the deployemnet scripts.

```sh
   cd  scripts
```

You will deploy-greeter-operator.ts and deploy-greeter.ts

### Deploy Greeter Smart Contract Deployment

The deploy-greeter.ts is used to deploy your greeter contract to either sepolia testnet or scroll sepolia testnet.

The deployement scripts looks like this:

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy();

  await greeter.deployed();

  console.log(`Greeter deployed to: ${greeter.address}`);

  // Record contract address in .env file
  fs.writeFileSync(".env", `GREETER_ADDRESS=${greeter.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

To deploy greeter to Sepolia (L1) run:

```sh
npx hardhat run --network sepolia scripts/deploy-greeter.ts
```

or

```sh
yarn deploy:sepolia
```

To deploy greeter to Scroll Sepolia Testnet (L2) run:

`npx hardhat run --network scrollTestnet scripts/deploy-greeter.ts`

Note: you can only deploy greeter contract to either L1 and deploy greeterOperator contract to L2 or deploy greeterOperator contract to L1 and greeter contract to L2.

Switch to the other chain and deploy the `GreeterOperator`. So, if you deployed the `Greeter` contract on L1, deploy the `GreeterOperator` on L2 or vice versa.

### GreeterOperator Smart Contract Deployment

The deploy-greeter-operator.ts is used to deploy your greeterOperator contract to either sepolia testnet or scroll sepolia testnet.

The GreeterOperator deploymenet script looks like this:

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const GreeterOperator = await ethers.getContractFactory("GreeterOperator");
  const greeterOperator = await GreeterOperator.deploy();

  await greeterOperator.deployed();

  console.log(`GreeterOperator deployed to: ${greeterOperator.address}`);

  // Record contract address in .env file
  fs.writeFileSync(
    ".env",
    `GREETER_OPERATOR_ADDRESS=${greeterOperator.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

To deploy greeterOperator to Scroll Sepolia Testnet (L2) run:

```sh
npx hardhat run --network scrollTestnet scripts/deploy-greeter.ts
```

or

```sh
yarn deploy:scrollTestnet
```

## Calling a Cross-chain Function

We pass the message by executing `executeFunctionCrosschain` and passing the following parameters:

- `scrollMessengerAddress`: This will depend on where you deployed the `GreeterOperator` contract.
  - If you deployed it on Sepolia, use `0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A`. If you deployed on Scroll Sepolia use `0xBa50f5340FB9F3Bd074bD638c9BE13eCB36E603d`.
- `targetAddress`: The address of the `Greeter` contract on the opposite chain.
- `value`: In this case, it is `0` because the `setGreeting`is not payable.
- `greeting`: This is the parameter that will be sent through the message. Try passing `“This message was cross-chain!”`
- `gasLimit`:

  - If you are sending the message from L1 to L2, around `1000000` gas limit should be more than enough. That said, if you set this too high, and `msg.value` doesn't cover `gasLimit` \* `baseFee`, the transaction will revert. If `msg.value` is greater than the gas fee, the unused portion will be refunded.
  - If you are sending the message from L2 to L1, pass `0`, as the transaction will be completed by executing an additional transaction on L1.

  Change your working directory to cross-communication, it is located in the scripts directory:

```sh
  cd cross-commnunication
```

you will see:

1. use-greeter-operator.ts
2. get-bridge-data.ts

The use-greeter-operator.ts is used to send the message to the greeter contract on L1 by calling `executeFunctionCrosschain` after initializing the greeterOperator instance for interaction.

make sure you have `ETHEREUM_RPC_URL` in your .env
you can get `ETHEREUM_RPC_URL` from alchemy, infura e.t.c.

run:
`npx hardhat run --network hardhat scripts//cross-communication/use-greeter-operator.ts` to run the use-greeter-operator.ts script

```javascript
import * as hre from "hardhat";
import { getEnv, getWallet } from "../utils";
import { ethers } from "ethers";
import { providers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL as string;

// Address of the contract to interact with
const CONTRACT_ADDRESS = getEnv("GREETER_OPERATOR_CONTRACT_ADDRESS");
const GREERTER_CONTRACT_ADDRESS = getEnv("GREETER_CONTRACT_ADDRESS");
console.log(`Contract address: ${CONTRACT_ADDRESS}`);

async function main() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact("GreeterOperator");

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet()
  );

  // Execute greeter function
  console.log("Executing greeter function...");
  const greeter = await contract.executeFunctionCrosschain(
    "0xba50f5340fb9f3bd074bd638c9be13ecb36e603d",
    GREERTER_CONTRACT_ADDRESS,
    0,
    "This message was cross-chain!",
    0
  );
  await greeter.wait();

  // Get the greeting message
  const greeterArtifact = await hre.artifacts.readArtifact("Greeter");
  const newGreeterArtifact = new ethers.Contract(
    GREERTER_CONTRACT_ADDRESS,
    greeterArtifact.abi,
    new providers.JsonRpcProvider(ETHEREUM_RPC_URL)
  );
  const testGreet = await newGreeterArtifact.greeting();
  console.log("testGreet", testGreet);

  console.log("Done!");
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});

```

You will need to wait for atleast 20 minutes for the transaction of `executeFunctionCrosschain` to be commited and finalized on the sepolia network to provide a proof that will be used. check [L2scan](https://scroll-sepolia.l2scan.co/) and put the deployer's wallet address of the contract in the search to seee if the transaction has been commited and finalized on the scroll bridge.

### Relay the Message when sending from L2 to L1

Check the `get-bridge-data.ts` and run the script using

```sh
 npx hardhat run --network hardhat scripts//cross-communication/get-bridge-data.ts
```

or

```sh
yarn com:greeter
```

the`get-bridge-data.ts` is a script that make it easy to get the data from the scroll bridge api.

```javascript
import axios from "axios";
import dotenv from "dotenv";
import { getEnv } from "../utils";

dotenv.config();

// Address of the contract to interact with
const CONTRACT_ADDRESS = getEnv("GREETER_OPERATOR_CONTRACT_ADDRESS");

async function main() {
  try {
    // Get the result from the Scroll bridge API
    const response = await axios.get(
      "https://sepolia-api-bridge.scroll.io/api/claimable",
      {
        params: {
          address: `${CONTRACT_ADDRESS}`,
          page_size: 10,
          page: 1,
        },
      }
    );

    const resultData = response.data.data.result[0];
    const {
      claimInfo: { from, to, value, nonce, message, proof, batch_index },
    } = resultData;

    // Log the extracted data
    console.log("From:", from);
    console.log("To:", to);
    console.log("Value:", value);
    console.log("Nonce:", nonce);
    console.log("Message:", message);
    console.log("Proof:", proof);
    console.log("Batch Index:", batch_index);
  } catch (error: any) {
    console.log(
      "Error occurred while fetching data:",
      error.response?.data?.message || error.message
    );
  }
}

main().catch((error) => {
  console.log("An unexpected error occurred:", error);
  process.exitCode = 1;
});

```

We're finalizing the API specifics, but for now, fetch or curl the following endpoint:

```bash
curl "https://sepolia-api-bridge.scroll.io/api/claimable?page_size=10&page=1&address=GREETER_OPERATOR_ADDRESS_ON_L2"
```

Replace `GREETER_OPERATOR_ADDRESS_ON_L2` with your GreeterOperator contract address as launched on L2. This has been handled by the `get-bridge-data.ts` automatically.

Read more about Execute Withdraw transactions
in the [Scroll Messenger](/developers/l1-and-l2-bridging/the-scroll-messenger) article.

Run `npx hardhat run --network hardhat scripts//cross-communication/get-bridge-data.ts` 20 minutes after you have ran `npx hardhat run --network hardhat scripts//cross-communication/use-greeter-operator.ts` you will have an output that looks like this:

```sh
From: 0xe67C615585Bb2fa90aF1B8993b5692123A0fFD14
To: 0x0E383e201DE95E681dcfd6F6f80fC6F955F3B812
Value: 0
Nonce: 344464
Message: 0xa41368620000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001d736574206772656574696e6720746f2068656c6c6f2c20776f726c6421000000
Proof: 0xbb9a5992c5aa65b4ca5132718bb722b4605bb193b60dc7be253d833ff5cd3e001399cacab706afb00c79e632d92ca4775deb8b0170a6a678f57db2c07091b454b4c11951957c6f8f642c4af61cd6b24640fec6dc7fc607ee8206a99e92410d3021ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85ca0d3df3aeb86c9d02a709a867c9cea3bc8b0806b59bea8eeef2b9148674f8030eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a19689a559d0f689366b992bb24f2870e8fef0eb77431764173063896f2d2c59220d1175361a26dc4f1c461183a20763097b1d59354b7a91b50ba5aed44ea7f8ba8bbcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0f9dc3e7fe016e050eff260334f18a5d4fe391d82092319f5964f2e2eb7c1c3a5f8b13a49e282f609c317a833fb8d976d11517c571d1221a265d25af778ecf8923490c6ceeb450aecdc82e28293031d10c7d73bf85e57bf041a97360aa2c5d99cc1df82d9c4b87413eae2ef048f94b4d3554cea73d92b0f7af96e0271c691e2bb68e8be5a0b1a50e94fe7360bc740ce973f4daf75768704a5681fa21951f52098da7bce9f4e8618b6bd2f4132ce798cdc7a60e7e1460a7299e3c6342a579626d27874b09783cef2e7750f7ea24f6090c9ce47f33cf25ca5e16a1207b4a50fda2be1d3b5c807b281e4683cc6d6315cf95b9ade8641defcb32372f1c126e398ef7a1ef973d30ca636d922d10ae577c73bc4fe92699225f30c0c2e9d6727bceb256d
Batch Index: 65265
```

When a transaction is passed from L2 to L1, an additional "execute withdrawal transaction" must be sent on L1. To do this, you must call `relayMessageWithProof` on the L1 Scroll Messenger
contract from an EOA wallet.

You can do this directly on [Etherscan Sepolia](https://sepolia.etherscan.io/address/0x50c7d3e7f7c656493d1d76aaa1a836cedfcbb16a#writeProxyContract#F3).
To do so, you will need to pass a Merkle inclusion proof for the bridged transaction and other parameters. You'll query these using the Scroll Bridge API.

<Aside type="danger" title="Experimental API">
  This API was made for our Bridge UI. It is not yet finalized and may change in
  the future. We will update this guide when the API is finalized.
</Aside>

<Aside type="caution" title="Anyone can execute your L2 → L1 Message">
  `relayMessageWithProof` is fully permissionless, so anyone can call it on your
  behalf if they're willing to pay the L1 gas fees. This feature allows for
  additional support infrastructure, including tooling to automate this process
  for applications and users.
</Aside>

After executing and confirming the transaction on both L1 and L2, the new state of `greeting` on the `Greeter` contract should be `“This message was cross-chain!”`. Sending a message from one chain to the other should take around 20 minutes after the transactions are confirmed on the origin chain.

Congratulations, you now executed a transaction from one chain to the other using our native bridge!

## Support

Join our Discord: [here](https://discord.com/invite/scroll)
