const MarketPlace = artifacts.require('MarketPlace.sol')
const NFT = artifacts.require('NFT.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

const { assert } = require('chai')
var ethers = require('ethers')    
const { interpolateAs } = require('next/dist/shared/lib/router/router')
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
            assert.notEqual(marketPlaceAddress, '')
        })

        it('NFT contract is deployed successfully', async() => {
            const nftAddress = nft.address
            assert.notEqual(nftAddress, '')
        })

        describe('creating token', async() => {
            it('NFT contract creates a new token', async() => {
                const uri = 'http://ipfs.imageaddress1'
                await nft.createToken(uri)
                const tokenURI = await nft.tokenURI(1)
                assert.equal(tokenURI, uri)
            })

            it('NFT marketplace contract creates a new token', async() => {
                let listingPrice = await marketPlace.getListingPrice()
                console.log('listing price: ', web3.utils.fromWei(listingPrice.toString(), 'ether'))
                let auctionPrice = ethers.utils.parseUnits('10', 'ether')
                await marketPlace.listNftOnMarketplace(nft.address, 1, auctionPrice, {value: listingPrice})
                const items = await marketPlace.getAllNfts()

                console.log('items: ', items)
            })

            if("Process sale of listed nft", async () => {
                const items = await marketPlace.getAllNfts()
                const price = items[0].price;

                await marketPlace.processSale(nft.address, 1, {from: accounts[1], value: price})

                // Get all unsold items
                
                // Current address buys nft
                
                // Get all unsold items

                // All unsold items should be less than before
                assert.isFalse(true, "Fix this test, redeploy and check ui integrations")
            })
        })
      })
    })
})