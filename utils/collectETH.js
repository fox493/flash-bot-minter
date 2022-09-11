import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config(".env")

const MODE = "mainnet"

const RPC_URL = `wss://${MODE}.infura.io/ws/v3/dac19ba0341a4ca48d42ae0cdf145481`
const provider = new providers.WebSocketProvider(RPC_URL)
const authSigner = Wallet.createRandom()
// const signer = new Wallet(process.env.PRIVATE_KEY)

const accounts = JSON.parse(fs.readFileSync("./accounts.json")).addresses

const main = async () => {
  const flashbot_provider = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    ` https://relay${MODE == "goerli" ? "-goerli" : ""}.flashbots.net`
  )
  let tx_bundle = []
  console.log("📦 packing...")
  console.time("packed!")
  for (let i = 1; i < 25; i++) {
    let account = accounts[i]
    let signer = new Wallet(account.private_key, provider)
    let tx = {
      transaction: {
        chainId: MODE == "goerli" ? 5 : 1,
        type: 2,
        value: (await signer.getBalance()).sub(
          ethers.utils.parseUnits("20", "gwei").mul(21000)
        ),
        // data: "0x8c874ebd",
        gasLimit: 21000,
        maxFeePerGas: ethers.utils.parseUnits("20", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("20", "gwei"),
        to: "0x73e6BC61DA58948Fe244071B39258478e5BcDBff",
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
