pragma solidity >=0.4.21 <0.7.0;

import './GenericERC20.sol';


contract GenericWallet {
    address payable private owner;
    
    // strings used by Privalege event
    string constant GRANTED = "Granted";
    string constant REVOKED = "Revoked";

    uint constant PAYMENT_AMOUNT = 500 finney;
    uint8 constant MAX_BULK_TRANSFER = 126;

    struct Application {
        string name;
        string description;
        GenericERC20 appERC20;
        mapping(address => bool) grantedAccounts;
        mapping(address => uint) accountsExpirationDate;
    }
    
    mapping(address => Application) applications;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyApplicationOwner {
        require(bytes(applications[msg.sender].name).length != 0, "Only Application Owner can call this function");
        _;
    }
    
    modifier onlyGrantedAccounts(address appOwner) {
        require(bool(applications[appOwner].grantedAccounts[msg.sender]) == true, "Only granted accounts can call this function.");
        require(applications[appOwner].accountsExpirationDate[msg.sender] >= now,"Expired access account.");
        _;
    }
    
    function newApplication(
        string memory name,
        string memory description,
        bool grantAccessToOwner, uint expireGrantAccess
    ) 
        public payable
    {
        require(bytes(applications[msg.sender].name).length == 0, "Address already have an application.");
        require(bytes(name).length != 0, "Parameter 'name' is empty");

        applications[msg.sender] = Application(name, description, new GenericERC20());
        if (grantAccessToOwner) {
            grantAccess(msg.sender, expireGrantAccess);
        }
        receiveDeposit();
        emit ApplicationCreated(msg.sender, name, applications[msg.sender].appERC20);
    }
    
    
    function grantAccess(address account, uint expireGrantAccess) public onlyApplicationOwner {
        require(expireGrantAccess > now, "expireGrantAccess value is lower than now");

        applications[msg.sender].grantedAccounts[account] = true;
        applications[msg.sender].accountsExpirationDate[account] = expireGrantAccess;
        emit Privilege(account, GRANTED, applications[msg.sender].accountsExpirationDate[account]);
    }
    
    function revokeAccess(address account) public onlyApplicationOwner {
        applications[msg.sender].grantedAccounts[account] = false;
        applications[msg.sender].accountsExpirationDate[account] = 0;
        emit Privilege(account, REVOKED, applications[msg.sender].accountsExpirationDate[account]);
    }
    
    
    function mint(address account, uint256 amount, address appOwner) public onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.mint(account, amount);
    }
    
    function burn(address account, uint256 amount, address appOwner) public onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.burn(account, amount);
    }
    
    function transfer(address sender, address recipient, uint256 amount, address appOwner) public onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.transfer(sender, recipient, amount);
    }
    
    function transferBulk(
        address[] memory senders,
        address[] memory recipients,
        uint256[] memory amounts,
        address appOwner
    ) 
        public 
        onlyGrantedAccounts(appOwner)
    {
        require(
            recipients.length == amounts.length &&
            senders.length == recipients.length,
            "senders, recipients and amounts must have equals length."
        );
        require(
            senders.length <= MAX_BULK_TRANSFER &&
            recipients.length <= MAX_BULK_TRANSFER &&
            amounts.length <= MAX_BULK_TRANSFER,
            "senders, recipients must be lower than 127 address."
        );

        uint8 i = 0;
        while(i < senders.length) {
            applications[appOwner].appERC20.transfer(senders[i], recipients[i], amounts[i]);
            i++;
        }
    }
    
    function balanceOf(address account, address appOwner) public view returns (uint256 balance) {
        return applications[appOwner].appERC20.balanceOf(account);
    }
    
    function totalSupply(address appOwner) public view returns (uint256 total)  { 
        return applications[appOwner].appERC20.totalSupply();
    }
    
    function expireTimeOf(address account, address appOwner) public view returns (uint expire) {
        return applications[appOwner].accountsExpirationDate[account];
    }
    
    function grantedAccessOf(address account, address appOwner) public view returns (bool hasGrant) {
        return applications[appOwner].grantedAccounts[account];
    }
    
    function erc20AddressOf(address appOwner) public view returns (GenericERC20 erc20Address) {
        return applications[appOwner].appERC20;
    }
    function receiveDeposit() private {
        require(msg.value == PAYMENT_AMOUNT, "You must send at least 0.5 ether.");
        (bool success, ) = owner.call.value(msg.value)("");
        require(success, "Transfer failed.");
    }
    
    /**
     * @dev Emitted when a new application with a `name` is create by a owner {appOwner}
     */
    event ApplicationCreated(address indexed appOwner, string name, GenericERC20 appERC20);
    
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`) from a especific application {appOwner}.
     *
     * Note that `value` may be zero.
     */
    event Privilege(address indexed account,string privilege, uint expirationDate);

}