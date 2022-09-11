import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config(".env")
const provider = new providers.WebSocketProvider(process.env.TESTNET_RPC_URL)
const authSigner = Wallet.createRandom()
// const signer = new Wallet(process.env.PRIVATE_KEY)

const accounts = JSON.parse(fs.readFileSync("./accounts.json")).addresses

const main = async () => {
  const flashbot_provider = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    "https://relay-goerli.flashbots.net"
  )
  let tx_bundle = []
  console.log("📦 packing...")
  console.time("packed!")
  let signer = new Wallet(process.env.PRIVATE_KEY, provider)        
  let nonce = await signer.getTransactionCount()
  for (let i = 0; i < 20; i++) {
    let account = accounts[i]
    let tx = {
      transaction: {
        // chainId: 1,
        chainId: 5,
        type: 2,
        value: 0,
        gasLimit: 21000,
        maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
        to: account,
        nonce: nonce++
      },
      signer,
    }
    tx_bundle.push(tx)
  }
  console.timeEnd("packed!")

  provider.on("block", async (block_number) => {
    console.log(block_number)

    const res = await flashbot_provider.sendBundle(tx_bundle, block_number + 1)

    if ("error" in res) {
      console.error(res.error.message)
      return
    }
    console.log(await res.simulate())
  })
}

main()
