// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// The Scroll Messenger interface is the same on both L1 and L2, it allows sending cross-chain transactions
// Let's import it directly from the Scroll Contracts library
import "@scroll-tech/contracts/libraries/IScrollMessenger.sol";

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
        IScrollMessenger scrollMessenger = IScrollMessenger(
            scrollMessengerAddress
        );
        // sendMessage is able to execute any function by encoding the abi using the encodeWithSignature function
        scrollMessenger.sendMessage{value: msg.value}(
            targetAddress,
            value,
            abi.encodeWithSignature("setGreeting(string)", greeting),
            gasLimit,
            msg.sender
        );
    }
}
