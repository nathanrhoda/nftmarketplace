const MarketPlace = artifacts.require('MarketPlace.sol')
const NFT = artifacts.require('NFT.sol')


require('chai')
    .use(require('chai-as-promised'))
    .should()

const { assert } = require('chai')
var ethers = require('ethers')    
var web3 = require('web3')

contract('Market', (accounts) => {
    contract('NFT', (accounts) => {
      let marketPlace, nft
      
      before(async() => {
          marketPlace = await MarketPlace.deployed()
          nft = await NFT.deployed()
      })

      describe('deployment', async() => {
            it('Market contract is deployed successfully', async() => {
                const marketPlaceAddress = marketPlace.address
                assert.notEqual(marketPlaceAddress, '', "Market Place Contract has not been deployed")
            })

            it('NFT contract is deployed successfully', async() => {
                const nftAddress = nft.address
                assert.notEqual(nftAddress, '', "NFT Contract has not been deployed")
            })
        })
        describe('creating token', async() => {
            it('NFT contract creates a new token', async() => {
                const uri = 'http://ipfs.imageaddress1'
                await nft.createToken(uri)
                const tokenURI = await nft.tokenURI(1)
                
                assert.equal(tokenURI, uri, "Expected token uri has been set")
            })

            it('NFT change uri after creation', async() => {
                const newUri = 'http://www.supercoloring.com/sites/default/files/styles/medium_no_levels/public/fif/2018/08/ironman-mask-template-paper-craft.png'                
                const originalTokenURI = await nft.tokenURI(1)

                await nft.setTokenUri(1, newUri);
                const newTokenUri = await nft.tokenURI(1)

                assert.equal(newUri, newTokenUri)
            })

            it('NFT marketplace contract creates a new token', async() => {
                const beforeListingNftCount = (await marketPlace.getAllNfts()).length
                let listingPrice = await marketPlace.getListingPrice()                
                let auctionPrice = ethers.utils.parseUnits('10', 'ether')                
                await marketPlace.listNftOnMarketplace(nft.address, 1, auctionPrice, {value: listingPrice})                                
                const afterListingNftCount = (await marketPlace.getAllNfts()).length

                assert.isTrue(beforeListingNftCount < afterListingNftCount, "New NFT has not been listed")
            })

            it("Process sale of listed nft", async () => {                
                const nftsPreSale = await marketPlace.getAllNfts()
                const beforeSaleCount = nftsPreSale.length
                const nftToBeSold = nftsPreSale[0]
                const price = nftsPreSale[0].price;
                                
                await marketPlace.processSale(nftToBeSold.nftContract, nftToBeSold.tokenId, {from: accounts[2], value: price})

                const nftsPostSale = await marketPlace.getAllNfts()
                const afterSaleCount = nftsPostSale.length                       
                                
                assert.isTrue(beforeSaleCount > afterSaleCount, "NFT should no longer be available for available on marketplace")                
            })
        })
        
        describe('Fetch tokens by wallet', async () => {
            it("Get all NFTs for specific wallet", async () => {
                const myNfts = await marketPlace.getMyNFTs( {from: accounts[2]} )                
                assert.equal(1, myNfts.length, "This wallet should have one nft")
            })
        })        
    })
})