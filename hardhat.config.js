require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-watcher");
require('solidity-coverage');
require('dotenv').config();
// require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: [`0x${process.env.MUMBAI_PRIV}`],
    },
    polygon: {
      url: process.env.POLYGON_URL,
      accounts: [`0x${process.env.MUMBAI_PRIV}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${process.env.ETHERSCAN_APIKEY}`,
  }
};
