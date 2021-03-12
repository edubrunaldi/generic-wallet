# GenericWallet
### _The Generic wallet management was created in the Ethereum blockchain allowing any application to use it._

You can see the GenericWallet contract on

raspennet: www.XYZ.com and 
mainnet: www.xyz.com.

## The problem
Companies put a lot of time and effort to create trustable wallet management for their applications.

    
- Creating atomic functions to rollback in case any error occurs during transactions
- Frequently transactions summarize to audit their wallet
- With a tight deadline, companies focus on results rather than good practices, thus adding business rules to the wallet management

## The solution
Blockchain solves these problems for us by creating a trustable environment where any transactions are atomic, public, anonymous, and can be verified using Ethereum blockchain explorer or any library that interacts with Ethereum.
Rather than focusing on the wallet management problem, companies can focus on their reports and usage.

## How GenericWallet works
GenericWallet allows anyone to create wallet management for their application. Every application creates an ERC20 contract where only granted accounts can manipulate it.

Only the owner can grant and/or revoke accounts. Every granted account must have an expiration date attached to it.

Every granted account can call the GenericWallet function almost the same as it is done with the ERC20 contract. The difference is you always must pass the `ownerAddress` parameter as well. That's because an account can be granted to N applications.

## Usage

Bellow, there are three lists. The first one is a list of functions for application administration, followed by a list of functions that interact with the application, and the last one is a list of events from GenericWallet.

#### Administration

* `newApplication(string name, string description,         bool grantAccessToOwner, uint expirationDate) payable`
    * Description: Create an application for the address sender. Only one application can created by address. As the sender will be the owner of this application, the sender can or cannot have grant access to manage the application (create transaction, mint, burn ...), you just need to set `grantAccessToOwner` to enable/disable it. If you set it to `true`, you must send a valid timestamp on `expirationDate` to when this grant will expire.
    * Payable: The sender must send 0.5 ether to create an application. That's the only payable function in the GenericWallet.
    * Emits an ApplicationCreated event.
    * Requirements: 
        * 0.5 ether.
        * `name` must be a non-empty string (`description` can be empty string)

* `grantAccess(address account, uint expirationDate) public onlyApplicationOwner`
    * Description: Grant access to an account for a temporary time to manage the application. the temporary time (`expirationDate`) can be set to any future moment.
    * Emits an Privilege event.
    * Requirements:
        *   `expirationDate` must be a future timestamp.
        *   This function must be called by the application owner.

* `revokeAccess(address account) public onlyApplicationOwner`
    * Description: The application owner can call this function to revoke a granted account.
    * expirationDate
    * Requirements:
        * This function must be called by the application owner.
---

#### Interacting with your application
* `mint(address account, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Generate `amount` to the `account` for an application (`appOwner`). This function increments the application`s total supply.
    * Requirements:
        * `account` must be different then the zero address.
        * This function must be called by an account with granted access.

* `burn(address account, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Remove `amount` to the `account` for an application (`appOwner`). This function decreases the application`s total supply.
    * Requirements:
        * `account` must be different then the zero address.
        * This function must be called by an account with granted access.

* `transfer(address sender, address recipient, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Transfer `amount` from `sender` to `recipient` for an application (`appOwner`).
    * Requirements:
        * Both `sender` and `recipient` must be different from the zero address.
        * This function must be called by an account with granted access.
        
* `transferBulk( address[] memory senders, address[] memory recipients, uint256[] memory amounts, address appOwner) public  onlyGrantedAccounts`
    * Description: Create 1 to 126 (inclusive) transactions in one request. Be aware that you can pay an expensive gas transaction with it.
    * Requirements:
        * Every address on `senders` and on `recipients` must be different from the zero address.
        * The size of `senders`, `recipients`, and `amounts` must be the same.
        * the size of `senders`, `recipients`, and `amounts` must be lower then 127;

* `balanceOf(address account, address appOwner) public view returns (uint256 balance) `
    * Description: Return the balance of and `account` from an application (`appOwner`)

* `totalSupply(address appOwner) public view returns (uint256 total)`
    * Description: Return the total of supply from an application (`appOwner`)

* `expireTimeOf(address account, address appOwner) public view returns (uint expire) `
    * Description: Return the expirationTime from an granted account from an application (`appOwner`)

* `grantedAccessOf(address account, address appOwner) public view returns (bool hasGrant)`
    * Description: Return if an account is granted for an application (`appOwner`)

* `erc20AddressOf(address appOwner) public view returns (GenericERC20 erc20Address) `
    * Description: Return the ERC20 address from an application

---

### Events
Every application has an ERC20 contract that emits the usual events..

* `ApplicationCreated(address indexed appOwner, string name, GenericERC20 appERC20)`
    * Description: Emit when a new application is created with the owner (`appOwner`) of the application, the `name` of the application, and the ERC20 address of the application.
* `Privilege(address indexed account,string privilege, address indexed appOwner, uint expirationDate)`
    * Description: Emit when an account receives grant/revoke privilege.

## TODO

[ ] Create a website
