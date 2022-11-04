import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, utils, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config(".env")
const provider = new providers.WebSocketProvider(process.env.MAINNET_RPC_URL)
const authSigner = Wallet.createRandom()
// const signer = new Wallet(process.env.PRIVATE_KEY)

const accounts = JSON.parse(fs.readFileSync("./accounts.json")).accounts
const main = async () => {
  const flashbot_provider = await FlashbotsBundleProvider.create(
    provider,
    authSigner
  )
  let tx_bundle = []
  console.log("📦 packing...")
  console.time("packed!")
  let signer = new Wallet(process.env.PRIVATE_KEY, provider)
  let nonce = await signer.getTransactionCount()
  for (let i = 90; i < 100; i++) {
    let account = accounts[i]
    let tx = {
      transaction: {
        chainId: 1,
        type: 2,
        value: ethers.utils.parseEther("0.003"),
        gasLimit: 21000,
        maxFeePerGas: ethers.utils.parseUnits("20", "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
        to: account.pub,
        nonce: nonce++,
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
      console.error(res.error)
      return
    }
    console.log(await res.simulate())
  })
}

main()
