import { ethers } from 'ethers'
import Web3 from 'web3'
import {useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  NftAddress,
  MarketAddress
} from '../config.js'

import NFT from '../build/contracts/NFT.json'
import MarketPlace from '../build/contracts/MarketPlace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(()=>{
    loadNFTs()
  }, [])

  async function loadNFTs(){
    const web3 = new Web3(window.ethereum);

    const appAccounts = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()

    const nftData = NFT.networks[networkId]
    const marketPlaceData = MarketPlace.networks[networkId]

    if(nftData && marketPlaceData) {

      var abi = NFT.abi
      var address = nftData.address
      const tokenContract = new web3.eth.Contract(abi, address)

      var abi = MarketPlace.abi
      address = marketPlaceData.address
      const marketContract = new web3.eth.Contract(abi, address)

      const data = await marketContract.methods.getAllNfts().call()

      const items = await Promise.all( data.map(async i => {
        const tokenUri = await tokenContract.methods.tokenURI(i.tokenId).call()
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return item
      }))

      setNfts(items)
      setLoadingState('loaded')
    } else {
      window.alert('smart contracts not deployed on selected network')
    }
  }

  async function buyNft(nft) {
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(MarketAddress, MarketPlace.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')    
    
    const transactin = await contract.processSale(NftAddress, nft.tokenId, {
      value: price
    } )
    await transactin.wait()
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length)
    return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{maxWidth: '1600px'}}>        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (

              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />

                <div className="p-4">
                  <p style={{height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  <button  className="-full bg-pink-500 text-white fond-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>BUY</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
