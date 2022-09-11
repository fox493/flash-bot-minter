import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config(".env")
const provider = new providers.WebSocketProvider(process.env.MAINNET_RPC_URL)
const authSigner = Wallet.createRandom()
// const signer = new Wallet(process.env.PRIVATE_KEY)

const accounts = JSON.parse(fs.readFileSync("./accounts.json")).addresses

const main = async () => {
  const flashbot_provider = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    // "https://relay-goerli.flashbots.net"
  )
  let tx_bundle = []
  console.log("📦 packing...")
  console.time("packed!")
  for (let i = 0; i < 25; i++) {
    let account = accounts[i]
    let signer = new Wallet(account.private_key, provider)
    let tx = {
      transaction: {
        chainId: 1,
        // chainId: 5,
        type: 2,
        value: 0,
        data: "0xa0712d680000000000000000000000000000000000000000000000000000000000000002",
        gasLimit: 140000,
        maxFeePerGas: ethers.utils.parseUnits("200", "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits("87", "gwei"),
        to: "0x745735600DCf9562060BEcDAE9A1a0AFfFcd9Cf6",
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
