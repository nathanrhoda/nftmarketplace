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
        const tokenUri = await tokenContract.methods.tokenUri(i.tokenId).call()
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

  if (loadingState === 'loaded' && !nfts.length)
    return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{maxWidth: '1600px'}}>        
      </div>
    </div>
  )
}
