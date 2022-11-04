import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, Wallet } from "ethers"
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
    authSigner,
    // "https://relay-goerli.flashbots.net"
  )
  let tx_bundle = []
  console.log("📦 packing...")
  console.time("packed!")
  for (let i = 60; i < 110; i++) {
    let account = accounts[i]
    let signer = new Wallet(account.pri, provider)
    let tx = {
      transaction: {
        chainId: 1,
        // chainId: 5,
        type: 2,
        value: 0,
        data: "0x9ff054df000000000000000000000000000000000000000000000000000000000000003c",
        gasLimit: 180000,
        maxFeePerGas: ethers.utils.parseUnits("16", "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
        to: "0x06450dee7fd2fb8e39061434babcfc05599a6fb8",
        nonce: await signer.getTransactionCount(),
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
