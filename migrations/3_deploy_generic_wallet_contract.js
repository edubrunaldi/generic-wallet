var GenericWallet = artifacts.require("GenericWallet");

module.exports = function(deployer) {
  deployer.deploy(GenericWallet);
};