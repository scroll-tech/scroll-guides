// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ExampleContract {
    uint public exampleVariable;

    function setExampleVariable(uint _exampleVariable) external {
        exampleVariable = _exampleVariable;
    }
}