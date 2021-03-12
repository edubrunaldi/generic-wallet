const GenericWallet = artifacts.require("GenericWallet");

contract("GenericWallet", accounts => {
  let gw;
  const accountZero = accounts[0];
  const accountOne = accounts[1];
  const accountTwo = accounts[2];
  const accountThree = accounts[3];
  const accountFour = accounts[4];
  const halfEther = web3.utils.toWei("500", "finney");
  const oneEther = web3.utils.toWei("1", "ether");
  const threeEther = web3.utils.toWei("3", "ether");
  const aLotOfEther = web3.utils.toWei("900", "ether");
  const onlyOwnerReasonExpected = "Only Application Owner can call this function";
  const grantedReasonExpected = "Only granted accounts can call this function.";
  const sameLengthReasonExpected = "senders, recipients and amounts must have equals length.";
  const lengthBiggerThanReasonExpected = "senders, recipients must be lower than 127 address.";
  const addressWithApplicationReasonExpected = "Address already have an application.";
  const granted = 'Granted';
  const revoked = 'Revoked';

  beforeEach(async () => {
    gw = await GenericWallet.deployed();
  });

  async function newAddress() {
    return (await web3.eth.accounts.create()).address;
  }

  it("Should create a new Application.", async () => {
    const result = await gw.newApplication("test", true, 95617584000000, { value: halfEther, from: accountZero });
    assert.equal(result.logs[1].event, "ApplicationCreated", "The log event create was not an  ApplicationCreated");
  });

  it("Contract owner should receive 0.5 ether when a new application is created", async () => {
    const initialAccountZero = await web3.eth.getBalance(accountZero);
    await gw.newApplication("test", true, 95617584000000, { value: halfEther, from: accountTwo });
    const finalAccountZero = await web3.eth.getBalance(accountZero);
    assert.equal(initialAccountZero, finalAccountZero - halfEther, "balance is different than expected");
  });

  it("Application owner must have granted access", async () => {
    await gw.newApplication("test", true, 95617584000000, { value: halfEther, from: accountThree });
    const grantedAccess = await gw.grantedAccessOf(accountThree, accountThree);
    assert.equal(grantedAccess, true, "Owner account without granted access");
  });

  it("Address with an application must fail to create a new application", async () => {
    await gw.newApplication("test", true, 95617584000000, { value: halfEther, from: accountOne });
    let reason = "";
    try {
      await gw.newApplication("test", true, 95617584000000, { value: halfEther, from: accountOne });
    } catch (error) {
      reason = error.reason;
    }
    assert.equal(reason, addressWithApplicationReasonExpected, "Error other than expected.");
  });

  it("Application owner grant access to an account should success", async () => {
    const address = await newAddress();
    await gw.grantAccess(address, 95617584000000, { from: accountOne });
    const grantedAccess = await gw.grantedAccessOf(address, accountOne);
    assert.equal(grantedAccess, true, "Account without grant access");
  });

  it("Application owner grant access to an account should create an event", async () => {
    const address = await newAddress();
    const result = await gw.grantAccess(address, 95617584000000, { from: accountOne });
    assert.equal(result.logs[0].args.privilege, granted, "The log event create was not a granted privilege");
  });

  it("Application owner revoke access to an account should success", async () => {
    const address = await newAddress();
    await gw.grantAccess(address, 95617584000000, { from: accountOne });
    await gw.revokeAccess(address, { from: accountOne });
    const grantedAccess = await gw.grantedAccessOf(address, accountOne, { from: accountOne });
    assert.equal(grantedAccess, false, "Account with grant access");
  });

  it("Application owner revoke access to an account should create an event", async () => {
    const address = await newAddress();
    await gw.grantAccess(address, 95617584000000, { from: accountOne });
    const result = await gw.revokeAccess(address, { from: accountOne });
    assert.equal(result.logs[0].args.privilege, revoked, "The log event create was not a revoked privilege");
  });

  it("Account no owner grant access to an account should fail", async () => {
    let reason = "";
    try {
      await gw.grantAccess(accountTwo, 95617584000000, { from: accountFour });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, onlyOwnerReasonExpected, "Error other than expected.");
  });

  it("Account no owner revoke access to an account should fail", async () => {
    let reason = "";
    try {
      await gw.grantAccess(accountTwo, 95617584000000, { from: accountFour });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, onlyOwnerReasonExpected, "Error other than expected.");
  });

  it("Mint to a account should success", async () => {
    const address = await newAddress();
    await gw.mint(address, halfEther, accountOne, { from: accountOne });

    const balance = await gw.balanceOf(address, accountOne);
    assert.equal(web3.utils.fromWei(balance, "finney"), 500, "balance with wrong amount");
  });

  it("Mint with a no grant account should fail", async () => {
    let reason = "";
    try {
      await gw.mint(accountTwo, halfEther, accountOne, { from: accountFour });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, grantedReasonExpected, "Error other than expected.");
  });

  it("Burn to a account should success", async () => {
    const address = await newAddress();
    await gw.mint(address, threeEther, accountOne, { from: accountOne });

    await gw.burn(address, halfEther, accountOne, { from: accountOne });

    const balance = await gw.balanceOf(address, accountOne);
    assert.equal(web3.utils.fromWei(balance, "finney"), 2500, "balance with wrong amount");
  });

  it("Burn with a no grant account should fail", async () => {
    const address = await newAddress();
    await gw.mint(address, threeEther, accountOne, { from: accountOne });
    let reason = "";
    try {
      await gw.burn(address, halfEther, accountOne, { from: accountFour });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, grantedReasonExpected, "Error other than expected.");
  });

  it("Transfer between accounts should success", async () => {
    const addressOne = await newAddress();
    const addressTwo = await newAddress();

    await gw.mint(addressOne, threeEther, accountOne, { from: accountOne });

    await gw.transfer(addressOne, addressTwo, halfEther, accountOne, { from: accountOne });
    const balance = await gw.balanceOf(addressTwo, accountOne);
    assert.equal(web3.utils.fromWei(balance, "finney"), 500, "balance with wrong amount");
  });

  it("Transfer between accounts with no granted account should fail", async () => {
    const addressOne = await newAddress();
    const addressTwo = await newAddress();
    await gw.mint(addressOne, threeEther, accountOne, { from: accountOne });

    let reason = "";
    try {
      await gw.transfer(addressOne, addressTwo, halfEther, accountOne, { from: accountFour });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, grantedReasonExpected, "Error other than expected.");
  });

  it("Transfer Bulk between 1 sender to 2 recipients should withdraw 1.5 ether from sender with success", async () => {
    const address = await newAddress();
    await gw.mint(address, threeEther, accountOne, { from: accountOne });
    await gw.transferBulk(
      [address, address],
      [await newAddress(), await newAddress()],
      [halfEther, oneEther],
      accountOne,
      { from: accountOne }
    );
    const balance = await gw.balanceOf(address, accountOne);
    assert.equal(web3.utils.fromWei(balance, "finney"), 1500, "Sender with wrong balance amount");
  });

  it("Transfer Bulk between 1 sender to 2 recipients should transfer 0.5 ether to addressOne success", async () => {
    const address = await newAddress();
    const addressOne = await newAddress();
    await gw.mint(address, threeEther, accountOne, { from: accountOne });
    await gw.transferBulk(
      [address, address],
      [addressOne, await newAddress()],
      [halfEther, oneEther],
      accountOne,
      { from: accountOne }
    );
    const balance = await gw.balanceOf(addressOne, accountOne);
    assert.equal(web3.utils.fromWei(balance, "finney"), 500, "addressOne with wrong balance amount");
  });

  it("Transfer Bulk between 1 sender to 2 recipients should transfer 1 ether to addressTwo success", async () => {
    const address = await newAddress();
    const addressOne = await newAddress();
    const addressTwo = await newAddress();
    await gw.mint(address, threeEther, accountOne, { from: accountOne });
    await gw.transferBulk(
      [address, address],
      [addressOne, addressTwo],
      [halfEther, oneEther],
      accountOne,
      { from: accountOne }
    );
    const balance = await gw.balanceOf(addressTwo, accountOne);
    assert.equal(web3.utils.fromWei(balance, "ether"), 1, "addressTwo with wrong balance amount");
  });

  it("Transfer between 1 sender to 126 recipients should success", async () => {
    const address = await newAddress();
    await gw.mint(address, aLotOfEther, accountOne, { from: accountOne });
    const senders = [];
    const recipients = [];
    const amounts = [];
    for (let i = 0; i < 126; i++) {
      senders.push(address);
      recipients.push(await newAddress());
      amounts.push(oneEther);
    }
    const result = await gw.transferBulk(
      senders,
      recipients,
      amounts,
      accountOne,
      { from: accountOne }
    );
    const balance = await gw.balanceOf(address, accountOne);
    assert.equal(web3.utils.fromWei(balance, "ether"), web3.utils.fromWei(aLotOfEther, "ether") - 126, "account with wrong balance amount");
  });

  it("Transfer between 1 sender to 0 recipients should fail", async () => {
    const address = await newAddress();
    await gw.mint(address, aLotOfEther, accountOne, { from: accountOne });
    let reason = "";
    try {
      await gw.transferBulk([address], [], [halfEther], accountOne, { from: accountOne });
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, sameLengthReasonExpected, "Error other than expected.");
  });

  it("Transfer between 1 sender to 127 recipients should fail", async () => {
    const address = await newAddress();
    await gw.mint(address, aLotOfEther, accountOne, { from: accountOne });
    const senders = [];
    const recipients = [];
    const amounts = [];
    for (let i = 0; i < 127; i++) {
      senders.push(address);
      recipients.push((await web3.eth.accounts.create()).address);
      amounts.push(oneEther);
    }

    let reason = "";
    try {
      await gw.transferBulk(
        senders,
        recipients,
        amounts,
        accountOne,
        { from: accountOne }
      );
    } catch (error) {
      reason = error.reason;
    }

    assert.equal(reason, lengthBiggerThanReasonExpected, "Error other than expected.");
  });

});
