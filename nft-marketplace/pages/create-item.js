import { useState } from 'react'
import { ethers } from 'ethers'
import { create as IPFS } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

import {
    MarketAddress, NftAddress
} from '../config'

import NFT from '../build/contracts/NFT.json'
import NFTMarket from '../build/contracts/MarketPlace.json'

export default function CreateItem() {
    
    const [ fileUrl, setFileUrl ] = useState(null)
    const [ formInput, updateFormInput ] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]

        try {
            const added = await client.add(
                file, 
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)            
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createMarket() {
        const { name, description, price } = formInput
        if(!name || !description || !price || !fileUrl) {
            return
        }                    
        
        const data = `{
            "name": "${name}",
            "description": "${description}",
            "image": "${fileUrl}",
            "attributes": [
                {
                    "trait_type": "Marvel Super Hero",
                    "value": "Hulk"
                },
                {
                    "trait_type": "Super Power",
                    "value": "Pushing Buttons"
                }        
            ]
        }`;

        console.log(data)
        try {
            const added = await client.add(data)            

            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            console.log(url)
            createSale(url)
        } catch (error) {
            console.log('Error uploading fileL ', error)
        }
    }

    async function createSale(url) {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = await provider.getSigner()
        
        let contract = new ethers.Contract(NftAddress, NFT.abi, signer)

        let transaction = await contract.createToken(url)
        
        let tx = await transaction.wait()
        
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(MarketAddress, NFTMarket.abi, signer)

        let listingPrice = await contract.getListingPrice()
        
        listingPrice = listingPrice.toString()

        //transaction = await contract.listNftOnMarketplace(NftAddress, tokenId, price, { value: listingPrice })
        
        await transaction.wait()
        
        router.push('/')

    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">

                <input
                    placeholder="NFT Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
            </div>
            <div>
                <textarea
                    placeholder="NFT Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
            </div>
            <div>
                <input
                    placeholder="NFT Price in ETH"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
            </div>
            <div>
                <input
                    type="file"
                    name="NFT"
                    className="my-4"
                    onChange={onChange}
                />

                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                }
            </div>
            <div>
                <button onClick={createMarket} className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
                    Create NFT
                </button>
            </div>            
        </div>
    )
}