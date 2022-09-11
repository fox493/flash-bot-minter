import { providers, utils, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config(".env")
const provider = new providers.WebSocketProvider(
  process.env.MAINNET_RPC_URL
)
const main_wallet = new Wallet(process.env.PRIVATE_KEY, provider)
const accounts = JSON.parse(fs.readFileSync("./accounts.json")).addresses

let index = 20
let send_until = 10
const main = async () => {
  console.log(`Transfer from ${await main_wallet.getAddress()}, balance: ${await main_wallet.getBalance()}`)
  let nonce = await main_wallet.getTransactionCount()
  const send_freg = async () => {
    let txs = []
    console.log(`sending...${index} to ${send_until}`)
    for (; index < send_until; index++) {
      let account = accounts[index]
      let tx = main_wallet.sendTransaction({
        to: account.public_key,
        value: utils.parseEther("0.04"),
        nonce: nonce,
      })
      nonce += 1
      txs.push(tx)
    }
    console.log(txs)
    await Promise.all(txs)
    console.log(`sent!`)
  }

  for (send_until; send_until <= 25; send_until += 5) {
    send_freg()
  }
}

main()
