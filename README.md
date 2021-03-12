# GenericWallet
### _Generic wallet management created in the Ethereum blockchain allowing any application to use it._

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

## Getting Started
todo

## Usage

Bellow, there are three lists. The first one is a list of functions for application administration, followed by a list of functions that interact with the application, and the last one is a list of events from GenericWallet.

#### Administration

* `newApplication(string name, string description,         bool grantAccessToOwner, uint expireGrantAccess) payable`
    * Description: Create an application for the address sender. Only one application can created by address. As the sender will be the owner of its application, the sender can or cannot have grant access to manage the application (create transaction, mint, burn ...) or just be the application administrator without grant access. You just need to set `grantAccessToOwner` to enable/disable. If you set it to `true`, you must send a valid timestamp on `expireGrantAccess` to when this grant will expire.
    * Payable: The sender must send 0.5 ether or more to create an application. That's the only payable function in the GenericWallet.
    * Requirements: 
        * 0.5 ether (or more).
        * `name` must be non-empty string (`description` can be empty string)
* `grantAccess(address account, uint expireGrantAccess) public onlyApplicationOwner`
    * Description: Grant access to an account for a temporary time to manage the application. the temporary time (`expireGrantAccess`) can be set to any future moment.
    * Requirements:
        *   `expireGrantAccess` must be a future timestamp.
        *   This function must be called by an application owner.
* `revokeAccess(address account) public onlyApplicationOwner`
    * Description: The application owner can call this function to revoke a granted address.
    * Requirements:
        * This function must be called by an application owner.
---

#### Interacting with your application
* `mint(address account, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Generate `amount` to the `account` for an application (`appOwner`). This function increments the `totalSupply` from your application.
    * Requirements:
        * `account` must be different then `address(0)`
        * This function must be called by an account with granted access.
* `burn(address account, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Remove `amount` to the `account` for an application (`appOwner`). This function decreases the total supply from your application.
    * Requirements:
        * `account` must be different then `address(0)`
        * This function must be called by an account with granted access.
* `transfer(address sender, address recipient, uint256 amount, address appOwner) public onlyGrantedAccounts`
    * Description: Transfer `amount` from `sender` to `recipient` for an application (`appOwner`).
    * Requirements:
        * Both `sender` and `recipient` must be different from `address(0)`.
        * This function must be called by an account with granted access.
* `transferBulk( address[] memory senders, address[] memory recipients, uint256[] memory amounts, address appOwner) public  onlyGrantedAccounts`
    * Description: Create 1 to 126 (inclusive) transactions in one request. Be aware that you can pay an expensive gas transaction with it.
    * Requirements:
        * Every address on `senders` and on `recipients` must be different from `address(0)`.
        * The size of `senders`, `recipients`, and `amounts` must be the same.
        * the size of `senders`, `recipients`, and `amounts` must be lower then 127;
* `balanceOf(address account, address appOwner) public view returns (uint256 balance) `
    * Description: Return the balance of and `account` from an application (`appOwner`)
* `totalSupply(address appOwner) public view returns (uint256 total)`
    * Description: Return the total of supply from an application (`appOwner`)

* `expireTimeOf(address account, address appOwner) public view returns (uint expire) `
    * Description: Return the expirationTime from an granted account from an application (`appOwner`)
* `grantedAccessOf(address account, address appOwner) public view returns (bool)`
    * Description: Return if an account is granted for an application (`appOwner`)
    grantedAccessOf(address account, address appOwner) public view returns (bool)
---

### Events

* `ApplicationCreated(address indexed appOwner, string name)`
    * Description: Emit when a new application is created with the owner (`appOwner`) of the application and the `name` of the application.
* `Transfer(address indexed from, address indexed to, uint256 value, address indexed application)`
    * Description: Almost equal to the ERC20 Transaction. This Transaction event emits every new transaction with the sender (`from`), the recipient (`to`), the `value`, and an additional parameter to know the application (`appOwner`).

## TODO

[ ] Create a website

[ ] Create a demo backend

[ ] Update Getting Started
