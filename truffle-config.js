const path = require("path");
require("dotenv").config();
var HDWalletProvider = require("truffle-hdwallet-provider");


const ropstenInfuraUrl = process.env.ROPSTEN_INFURA_URL;
const mainnetInfuraUrl = process.env.MAINNET_INFURA_URL;
const mnemonic = process.env.MNENOMIC;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    develop: { // default with truffle unbox is 7545, but we can use develop to test changes, ex. truffle migrate --network develop
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777"
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, ropstenInfuraUrl);
      },
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
     },
     mainnet: {
      provider: () => {
        return new HDWalletProvider(mnemonic, mainnetInfuraUrl);
      },
      network_id: 1,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
     }
  }
};
