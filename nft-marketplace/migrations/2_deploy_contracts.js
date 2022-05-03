const MarketPlace = artifacts.require('./MarketPlace.sol')
const NFT = artifacts.require('./NFT.sol')

module.exports = async function(deployer){
	await deployer.deploy(MarketPlace);
	const marketContract = await MarketPlace.deployed();
	const marketAddress = marketContract.address;
	await deployer.deploy(NFT,marketAddress);
};