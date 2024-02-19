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
