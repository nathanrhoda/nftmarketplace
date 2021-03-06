// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;


import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	address contractAddress;
	address private _owner;  	

	constructor(address marketplaceAddress) ERC721("SUPERHEROS", "SPH") {
		contractAddress = marketplaceAddress;
		_owner = msg.sender;	
	}

	modifier onlyCreator() {
		require(_owner == msg.sender, "Only creator of NFT can perform this action");
		_;
	}

	function createToken(string memory tokenURI) 
		public
		onlyCreator
		returns (uint) 		
	{ 
		_tokenIds.increment();
		uint256 newItemId=_tokenIds.current();

		_mint(msg.sender, newItemId);
		_setTokenURI(newItemId, tokenURI);
		setApprovalForAll(contractAddress, true);
		return newItemId;
	}	

	function setTokenUri(uint tokenId, string memory tokenURI) 
		public 
		onlyCreator 
	{
		_setTokenURI(tokenId, tokenURI);
	}	
}