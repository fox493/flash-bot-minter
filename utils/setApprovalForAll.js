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
  for (let i = 0; i < 20; i++) {
    let account = accounts[i]
    let signer = new Wallet(account.private_key, provider)
    let tx = {
      transaction: {
        // chainId: 1,
        chainId: 5,
        type: 2,
        value: 0,
        data: "0xa22cb4650000000000000000000000001e0049783f008a0085193e00003d00cd54003c710000000000000000000000000000000000000000000000000000000000000001",
        gasLimit: 60000,
        maxFeePerGas: ethers.utils.parseUnits("20", "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits("20", "gwei"),
        to: "0xabADb7C1B2D14bcb38658Aa582F5aA85ac27dAAA",
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
