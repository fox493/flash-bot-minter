import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { ethers, providers, utils, Wallet } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";
import cliProgress from "cli-progress";
import bar_color from "ansi-colors";
import inquirer from "inquirer";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config(".env");

const provider = new providers.WebSocketProvider(process.env.MAINNET_RPC_URL);
const authSigner = Wallet.createRandom();

/**
 *  NFT归集脚本
 *
 *  脚本使用者仅需配置这里就行
 *  FROM  从第几个账户开始
 *  TO    到第几个账户结束
 *  （记得要减1，也就是说比如从第1个到100个，那么就是FROM = 0， TO = 100）
 *  VALUE                  每个账户要转账的金额
 *  MAXFEEPERGAS           最大gas费
 *  MAXPRIFEE              最大矿工费（这里建议就用1.5）
 *  MAIN_WALLET            NFT归集地址
 *  NFT_CONTRACT_ADDRESS   NFT合约地址
 *
 */

const FROM = 0;
const TO = 10;
const MAXFEEPERGAS = "20";
const MAXPRIFEE = "1.5";
const MAIN_WALLET = "0x5181E7418b1BeDfc176703741E1b8A887E65a525";
const NFT_CONTRACT_ADDRESS = "0x21117713a4eC1a3e06d6d260149C90Ba9c593FD9";

const accounts = JSON.parse(fs.readFileSync("./accounts.json")).accounts;

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_GOERLI,
});

const main = async () => {
  const flashbot_provider = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    "https://relay-goerli.flashbots.net"
  );
  let tx_bundle = [];
  let nft_counter = 0;
  const iface = new ethers.utils.Interface([
    "function safeTransferFrom(address from,address to,uint256 tokenId) external payable",
  ]);

  const bar = new cliProgress.SingleBar(
    {
      format:
        "🦄️ 正在收集NFT数据..." + bar_color.green("{bar}") + " {percentage}%",
    },
    cliProgress.Presets.shades_classic
  );
  bar.start(TO - FROM - 1);
  for (let i = FROM; i < TO; i++) {
    let account = accounts[i];
    let succeed = false;
    let retrytime = 3;
    while (!succeed) {
      try {
        const res = await alchemy.nft.getNftsForOwner(account.pub, {
          contractAddresses: NFT_CONTRACT_ADDRESS,
        });
        if (!res.ownedNfts.length) {
          continue;
        } else {
          account.ownedNft = res.ownedNfts.map((nft) => nft.tokenId);
          nft_counter += res.ownedNfts.length;
        }
        succeed = true;
        bar.update(i);
      } catch (error) {
        retrytime--;
        if (retrytime < 0) {
          console.log("请求alchemy接口遇到问题, 请重新运行脚本尝试");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  const choice = await inquirer.prompt([
    {
      name: "collect",
      type: "confirm",
      message: `💰 将有${nft_counter}个NFT被归集到${MAIN_WALLET}, 确认后开始打包交易`,
    },
  ]);
  if (!choice.collect) process.exit(0);

  const bar_2 = new cliProgress.SingleBar(
    {
      format:
        "📦 正在打包交易..." + bar_color.green("{bar}") + " {percentage}%",
    },
    cliProgress.Presets.shades_classic
  );
  bar_2.start(TO - FROM - 1);
  for (let i = FROM; i < TO; i++) {
    let account = accounts[i];
    if (!"ownedNft" in account) continue;
    let signer = new Wallet(account.pri, provider);
    let nonce = await signer.getTransactionCount();
    for (let token_id of account.ownedNft) {
      const data = iface.encodeFunctionData("safeTransferFrom", [
        account.pub,
        MAIN_WALLET,
        token_id,
      ]);
      let tx = {
        transaction: {
          chainId: 5,
          type: 2,
          value: 0,
          gasLimit: 140000,
          data,
          maxFeePerGas: ethers.utils.parseUnits(MAXFEEPERGAS, "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits(MAXPRIFEE, "gwei"),
          to: NFT_CONTRACT_ADDRESS,
          nonce: nonce++,
        },
        signer,
      };
      tx_bundle.push(tx);
    }
    bar_2.update(i);
  }
  console.log(tx_bundle);
  const choice_2 = await inquirer.prompt([
    {
      type: "confirm",
      name: "send",
      message: "🚛 交易打包完成, 确认后将向flashbot节点发送交易",
    },
  ]);
  if (!choice_2.send) process.exit(0);
  console.log("📢 开始发送...");
  provider.on("block", async (block_number) => {
    console.log("发送到区块：", block_number);
    const res = await flashbot_provider.sendBundle(tx_bundle, block_number + 1);

    if ("error" in res) {
      console.error(res.error);
      return;
    }
    console.log(await res.simulate());
  });
};

main();
