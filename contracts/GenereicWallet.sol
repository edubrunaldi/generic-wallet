pragma solidity >=0.4.21 <0.7.0;

import './GenericERC20.sol';


contract GenericWallet {
    address payable private owner;

    struct Application {
        string name;
        string description;
        GenericERC20 appERC20;
        mapping(address => bool) grantedAccounts;
        mapping(address => uint) accountsExpireTime;
    }
    
    mapping(address => Application) applications;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyApplicationOwner {
        require(bytes(applications[msg.sender].name).length != 0, "Only Application Owner can call this function");
        _;
    }
    
    modifier _onlyGrantedAccounts(address appOwner) {
        require(bool(applications[appOwner].grantedAccounts[msg.sender]) == true, "Only granted accounts can call this function.");
        require(applications[appOwner].accountsExpireTime[msg.sender] >= now,"Expired access account.");
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
        emit ApplicationCreated(msg.sender, name);
    }
    
    
    function grantAccess(address account, uint expireGrantAccess) public onlyApplicationOwner {
        require(expireGrantAccess > now, "expireGrantAccess value is lower than now");
        applications[msg.sender].grantedAccounts[account] = true;
        applications[msg.sender].accountsExpireTime[account] = expireGrantAccess;
    }
    
    function revokeAccess(address account) public onlyApplicationOwner {
        applications[msg.sender].grantedAccounts[account] = false;
        applications[msg.sender].accountsExpireTime[account] = 0;
    }
    
    
    function mint(address account, uint256 amount, address appOwner) public _onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.mint(account, amount);
        emit Transfer(address(0), account, amount, appOwner);
    }
    
    function burn(address account, uint256 amount, address appOwner) public _onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.burn(account, amount);
        emit Transfer(account, address(0), amount, appOwner);
    }
    
    function transfer(address sender, address recipient, uint256 amount, address appOwner) public _onlyGrantedAccounts(appOwner) {
        applications[appOwner].appERC20.transfer(sender, recipient, amount);
        emit Transfer(sender, recipient, amount, appOwner);
    }
    
    function transferBulk(
        address[] memory senders,
        address[] memory recipients,
        uint256[] memory amounts,
        address appOwner
    ) 
        public 
        _onlyGrantedAccounts(appOwner)
    {
        require(
            recipients.length == amounts.length &&
            senders.length == recipients.length,
            "senders, recipients and amounts must have equals length."
        );
        require(
            senders.length < 127 &&
            recipients.length < 127 &&
            amounts.length < 127,
            "senders, recipients must be lower than 127 address."
        );

        uint8 i = 0;
        while(i < senders.length) {
            applications[appOwner].appERC20.transfer(senders[i], recipients[i], amounts[i]);
            emit Transfer(senders[i], recipients[i], amounts[i], appOwner);
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
        return applications[appOwner].accountsExpireTime[account];
    }
    
    function grantedAccessOf(address account, address appOwner) public view returns (bool) {
        return applications[appOwner].grantedAccounts[account];
    }
    
    function receiveDeposit() private {
        require(msg.value >= 500 finney, "You must send at least 0.5 ether.");
        (bool success, ) = owner.call.value(msg.value)("");
        require(success, "Transfer failed.");
    }
    
    /**
     * @dev Emitted when a new application with a `name` is create by a `owner`
     */
    event ApplicationCreated(address indexed owner, string name);
    
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`) from a especific {application}.
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value, address indexed application);

}