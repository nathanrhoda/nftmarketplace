import {  useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import axios from 'axios'


import {
    MarketAddress, NftAddress
} from '../config'

import NFT from '../build/contracts/NFT.json'
import NFTMarket from '../build/contracts/MarketPlace.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])

    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = await provider.getSigner()

        const marketContract = new ethers.Contract(MarketAddress, NFTMarket.abi, signer)

        const tokenContract = new ethers.Contract(NftAddress, NFT.abi, provider)

        const data = await marketContract.getMyNFTs()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatEther(i.price.toString())
            
            let item = {
                price,
                token: i.tokenId,
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
            }
            return item
        }))

        setNfts(items)
        setLoadingState('loaded')
    }
    
    if (loadingState === 'loaded' && !nfts.length) 
        return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )


}