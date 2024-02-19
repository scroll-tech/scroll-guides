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
