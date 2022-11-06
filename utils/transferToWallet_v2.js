import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import { ethers, providers, utils, Wallet } from "ethers"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config(".env")
const provider = new providers.WebSocketProvider(process.env.MAINNET_RPC_URL)
const authSigner = Wallet.createRandom()

/**
 *  脚本使用者仅需配置这里就行
 *  FROM  从第几个账户开始
 *  TO    到第几个账户结束
 *  （记得要减1，也就是说比如从第1个到100个，那么就是FROM = 0， TO = 100）
 *  VALUE           每个账户要转账的金额
 *  MAXFEEPERGAS    最大gas费
 *  MAXPRIFEE       最大矿工费（这里建议就用1.5）
 *
 *  这里要说明下，最大gas费的配置可以理解为一个你期望成交的gas，举例来讲当前以太坊gas
 *  为20gwei，而你希望可以在15gwei下成交，那么你就可以把这个值设置为15，flashbot会不断地
 *  为你发送交易，直到成交后才会停下
 *
 *  ===== Q&A =====
 *  Q：如何判断交易成功了？
 *  A：脚本的原理是将大量交易打包后一起发送，那么每笔交易都有自己的一个nonce值（可以自己搜索一下），
 *  这个nonce是不能重复的，所以说交易成功后flashbot再次发送交易的话，会报错提示nonce已经存在，那么
 *  这时你就可以确定交易已经被接收，可以去etherscan确认了
 * 
 *  Q: 一次最多多少笔交易？
 *  A：我个人测试后貌似最大50笔交易打包，所以如果100个账户的话，需要分两次完成（不会多花gas的）
 */

const FROM = 0
const TO = 100
const VALUE = "0.003"
const MAXFEEPERGAS = "20"
const MAXPRIFEE = "1.5"

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
  for (let i = FROM; i < TO; i++) {
    let account = accounts[i]
    let tx = {
      transaction: {
        chainId: 1,
        type: 2,
        value: ethers.utils.parseEther(VALUE),
        gasLimit: 21000,
        maxFeePerGas: ethers.utils.parseUnits(MAXFEEPERGAS, "gwei"),
        // maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(30),
        maxPriorityFeePerGas: ethers.utils.parseUnits(MAXPRIFEE, "gwei"),
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
