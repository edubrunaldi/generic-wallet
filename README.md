# GenericWallet
### _GenericWallet was created in the Ethereum blockchain allowing any application to use it._

You can see the GenericWallet contract on Ropsten Testnet Network : [0x9CfA6313047de18d0d002Bb49D15Fa563a867034](https://ropsten.etherscan.io/address/0x9CfA6313047de18d0d002Bb49D15Fa563a867034)

## The problem
Companies put a lot of time and effort to create trustable wallet management for their applications.

    
- Creating atomic functions to rollback in case any error occurs during transactions
- Frequently summarizing transactions to audit their wallet
- With tight deadlines, companies focus on the results rather than good practices, thus adding business rules to the wallet management

## The solution
Blockchain solves these problems for us by creating a trustable environment where transactions are atomic, public, anonymous, and can be verified using Ethereum blockchain explorer or any library that interacts with Ethereum.
Instead of focusing on the wallet management problem, companies can focus on their reports and usage.

## How GenericWallet works
GenericWallet allows anyone to create wallet management for their application. Every application creates an ERC20 contract where only accounts with access permission can manipulate it.

Only the owner can grant or revoke an account's access permission. Every account with granted access must have an expiration date attached to it.

Every account with access permission can call the GenericWallet function almost the same as it is done with the ERC20 contract. The difference is you always must send the `ownerAddress` parameter as well. That's because an account can be granted to N applications.



![GenericWallet Example](images/GenericWallet.png)

## Usage

Below, there are three lists. The first is a list of functions for application administration, followed by a list of functions that interact with the application, and the last is a list of events from GenericWallet.

#### Administration

* `newApplication(string name, bool grantAccessToOwner, uint expirationDate) payable`
    * Description: Create an application for the address sender. Only one application can be created by address. As the sender will be the owner of this application, the sender can or cannot have grant access to manage the application (create transaction, mint, burn ...), you just need to set `grantAccessToOwner` to enable/disable it. If you set it to `true`, you must send a valid timestamp on `expirationDate` to when this grant will expire.
    * Payable: The sender must send 0.5 ether to create an application. That's the only payable function in the GenericWallet.
    * Emits an ApplicationCreated event.
    * Requirements: 
        * 0.5 ether.
        * `name` must be a non-empty string

* `grantAccess(address account, uint expirationDate) public onlyApplicationOwner`
    * Description: Grant access to an account for a temporary time to manage the application. the temporary time (`expirationDate`) can be set to any future moment.
    * Emits a Privilege event.
    * Requirements:
        *   `expirationDate` must be a future timestamp.
        *   This function must be called by the application owner.

* `revokeAccess(address account) public onlyApplicationOwner`
    * Description: The application owner can call this function to revoke a granted account.
    * expirationDate
    * Emits a Privilege event.
    * Requirements:
        * This function must be called by the application owner.
---

#### Interacting with your application
* `mint(address account, uint256 amount, address ownerAddress) public onlyGrantedAccounts`
    * Description: Generate `amount` to the `account` for the application (`ownerAddress`). This function increments the total supply from your application.
    * Emits a Transaction event.
    * Requirements:
        * `account` must be different then the zero address.
        * This function must be called by an account with granted access.

* `burn(address account, uint256 amount, address ownerAddress) public onlyGrantedAccounts`
    * Description: Remove `amount` to the `account` for the application (`ownerAddress`). This function decreases the total supply from your application.
    * Emits a Transaction event.
    * Requirements:
        * `account` must be different than the zero address.
        * This function must be called by an account with granted access.

* `transfer(address sender, address recipient, uint256 amount, address ownerAddress) public onlyGrantedAccounts`
    * Description: Transfer `amount` from `sender` to `recipient` for the application (`ownerAddress`).
    * Emits a Transaction event.
    * Requirements:
        * Both `sender` and `recipient` must be different from the zero address.
        * This function must be called by an account with granted access.
* `transferBulk( address[] memory senders, address[] memory recipients, uint256[] memory amounts, address ownerAddress) public  onlyGrantedAccounts`
    * Description: Create 1 to 126 (inclusive) transactions in one request. **Be aware that you can pay an expensive gas transaction with it**.
    * Emits a Transaction event.
    * Requirements:
        * Every address on `senders` and on `recipients` must be different from the zero address.
        * The size of `senders`, `recipients`, and `amounts` must be the same.
        * the size of `senders`, `recipients`, and `amounts` must be lower than 127;

* `balanceOf(address account, address ownerAddress) public view returns (uint256 balance) `
    * Description: Return the balance of and `account` from the application (`ownerAddress`)

* `totalSupply(address ownerAddress) public view returns (uint256 total)`
    * Description: Return the total of supply from the application (`ownerAddress`)

* `grantedAccessOf(address account, address ownerAddress) public view returns (bool)`
    * Description: Return if an account is granted for the application (`ownerAddress`)
    grantedAccessOf(address account, address ownerAddress) public view returns (bool)
---

### Events

* `ApplicationCreated(address indexed ownerAddress, string name)`
    * Description: Emitted when a new application is created with the owner (`ownerAddress`) of the application, the `name` of the application.
* `Privilege(address indexed account,string privilege, address indexed ownerAddress, uint expirationDate)`
    * Description: Emitted when an account receives grant/revoke privilege.
* `event Transfer(address indexed from, address indexed to, uint256 value, address indexed ownerAddress)`
    * Description: Emitted when `value` tokens are moved from one account (`from`) to another (`to`) in a specific application (`ownerAddress`).

## TODO

[ ] Create a website
