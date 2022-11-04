import { ethers } from "ethers"
import fs from "fs"

const wallet = ethers.Wallet.createRandom()

const data = {
  mnemonic: wallet.mnemonic.phrase,
  accounts: [],
}

const HDNode = ethers.utils.HDNode.fromMnemonic(wallet.mnemonic.phrase)

for (let i = 0; i < 100; i++) {
  const node = HDNode.derivePath(`m/44'/60'/0'/0/${i}`)
  data.accounts.push({
    pub: node.address,
    pri: node.privateKey,
  })
}

if (!fs.existsSync("accounts.json")) {
  fs.writeFile("./accounts.json", JSON.stringify(data, 0, 4), (err) => {
    if (err) console.error(err)
    else {
      console.log("🤩 100 accounts generated successfully!")
    }
  })
} else {
  console.log(
    "You've already generated 100 accounts, are you sure to generate a new one?\nIf you want please delete accounts.json, and remember to backup the mnemonic first⚠️!!!"
  )
}
