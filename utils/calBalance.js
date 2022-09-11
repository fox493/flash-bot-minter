import { providers, utils, Wallet } from "ethers"
import cliProgress from "cli-progress"
import bar_color from "ansi-colors"
import dotenv from "dotenv"
dotenv.config(".env")
import fs from "fs"
const accounts = JSON.parse(fs.readFileSync("./accounts.json")).addresses
const provider = new providers.WebSocketProvider(process.env.MAINNET_RPC_URL)
let total_balance = 0
const main = async () => {
  let index = 1 
  let res = []
  const bar = new cliProgress.SingleBar(
    {
      format:
        "Scanning Progress " +
        bar_color.green("{bar}") +
        " {percentage}% || {value}/{total} accounts",
    },
    cliProgress.Presets.shades_classic
  )
  bar.start(accounts.length)
  for (let account of accounts) {
    let wallet = new Wallet(account.private_key, provider)
    let bal = utils.formatEther(await wallet.getBalance())
    if(bal > 0) res.push(`account${index} balance: ${bal} eth`)
    bar.update(index++)
    total_balance += Number(bal)
  }
  console.log(res)
  console.log(`\n💰 Total Balance: ${total_balance.toFixed(3)} eth`)
  process.exit(0)
}
main()
