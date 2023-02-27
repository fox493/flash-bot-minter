[中文](https://github.com/fox493/flash-bot-minter/blob/main/README_CN.md) / English
# flash-bot-minter

Use bulk accounts to mint NFT through the flash bot.

## Introduction

This script was originally written for me to bulk mint XEN, but you can modify it to perform other bulk operations, such as bulk mint NFT, bulk token sending, and NFT collection. Additionally, here are a few benefits of using flashbot:

1. No loss of gas fee if the transaction fails. If you participate in an NFT public sale and fail in a gas war, you won't lose gas.
2. You can set a reasonable and acceptable gas price, start the script and wait for the transaction to be completed. When Ethereum gas drops to your set value, and a flashbot miner receives your transaction, your transaction can be completed.

The disadvantages of using flashbot are:

1. Transactions may not be accepted. Even if you give a high gas fee, in some cases, there is a certain probability that the transaction will still not be accepted. So, if you really want to succeed in participating in an NFT public sale, please do not use flashbot.
2. Flashbot can only package a maximum of 50 transactions simultaneously (of course, this can be solved by starting multiple processes).

## Script principle

The script uses flashbot to package and send transactions, meaning that many transactions can be traded simultaneously and executed in the same block. The principle of flashbot is to listen to each generated block and send a transaction each time a block is packaged. Once the transaction is accepted, it can be stopped. You can also configure your expected gas fee. Personally, I think it is useful in scenarios where bulk transactions are required. The script is designed to batch mint XEN tokens. First, 100 wallet addresses and mnemonics are generated manually (these 100 addresses are under the same mnemonic for easy management). Then, the money is manually distributed from the main wallet to 100 addresses, and finally, 100 addresses are used to mint XEN.

## 脚本配置

There are only 3 files that need to be configured:

```
utils/transerToWallet_v2.js
index.js
.env.example
```

The first two have detailed comments on how to configure them in the file. The last file is detailed as follows:

```
PRIVATE_KEY="Your main wallet's private key (for money splitting)"
MAINNET_RPC_URL="RPC URL, register an infura, remember to use websockets"
ALCHEMY_KEY="If you want to use the NFT collection function, you need to use the alchemy SDK, register alchemy and obtain a key"
```

**After configuration, change the file name to .env to take effect!**

## Directory Structure
The final directory structure is as follows:

```
├── README.md
├── accounts.json
├── format.js
├── index.js
├── package.json
├── .env
├── utils
│   ├── calBalance.js
│   ├── generateWallets.js
│   └── transferToWallet_v2.js
│   └── collectNFT.js
└── yarn.lock
```

**Be sure to keep your mnemonics confidential and not leak any content in accounts.json or .env!!**

## Script Usage

First, you need a node environment on your computer. Google or Baidu for self-configuration:

```shell
node utils/generateWallets    生成n个钱包+助记词
node utils/transferToWallet_v2     把钱分散到n个钱包
node index     用批量钱包去mint XEN
node format 	整理钱包地址，生成一个txt文件，复制后可以直接粘贴到CryptoCell工具监控自己的XEN数量
node utils/calBalance 检查所有钱包共计剩余多少ether
node utils/collectNFT 将NFT归集到一个钱包内

```

## Q&A

Q: How to determine if a transaction is successful?
A: The principle of the script is to bundle a large number of transactions and send them together. Each transaction has its own nonce value (which can be searched by oneself). This nonce cannot be duplicated. Therefore, if flashbot tries to send the transaction again after it is successful, it will give an error message indicating that the nonce already exists. At this time, you can confirm that the transaction has been received and check it on etherscan.

Q: What is the maximum number of transactions per batch?
A: Based on my personal testing, it seems that up to 50 transactions can be bundled together. Therefore, if there are 100 accounts, two batches are required to complete the transactions (without spending extra gas).


## Case

1. Recently, I participated in an NFT public sale using flashbot. This NFT was stealth launched, so I didn't know when it would start. My solution was to suspend the script in advance on the server using pm2 and continuously send mint transactions. Even if a failed transaction is rolled back, it will not waste gas.

## Contact Information 

wechat: foxof_eth
twitter: @xof2021
