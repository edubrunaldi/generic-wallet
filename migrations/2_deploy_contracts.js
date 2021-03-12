// const SimpleStorage = artifacts.require("SimpleStorage");
// const TutorialToken = artifacts.require("TutorialToken");
// const ComplexStorage = artifacts.require("ComplexStorage");

// module.exports = function(deployer) {
//   deployer.deploy(SimpleStorage);
//   deployer.deploy(TutorialToken);
//   deployer.deploy(ComplexStorage);
// };

var GenericWallet = artifacts.require("GenericWallet");

module.exports = function(deployer) {
  deployer.deploy(GenericWallet);
};