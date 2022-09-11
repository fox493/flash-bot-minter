import { Wallet } from "ethers";
import fs from 'fs'
const mnemonic = Wallet.createRandom().mnemonic
let accounts = {
    mnemonic: mnemonic.phrase,
    path: mnemonic.path,
    addresses: []
}
for(let i = 0; i < 50; i++) {
    let new_wallet = Wallet.fromMnemonic(mnemonic.phrase, mnemonic.path+'/'+i)
    accounts.addresses.push({
        public_key: new_wallet.address,
        private_key: new_wallet.privateKey
    })
}
if(fs.existsSync('./accounts.json')) {
    console.log('already exist')
    process.exit(1)
}
fs.writeFileSync('./accounts.json', JSON.stringify(accounts))
