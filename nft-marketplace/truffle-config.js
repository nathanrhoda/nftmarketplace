require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
var privateKey = process.env["ACCOUNT"];
var url = process.env["URL"];

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    rinkeby:{
      host: "localhost",
      provider: function() {
        return new HDWalletProvider(privateKey, url);
      },
      
      network_id:4,           
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.12",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  },
};
