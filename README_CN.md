中文 / [English](https://github.com/fox493/flash-bot-minter/blob/main/README.md)
# flash-bot-minter

Use bulk accounts to mint NFT through the flash bot.

## 说明
该脚本是我写来去批量mint XEN的，大家也可以自己修改一下来做一些其他批量操作，例如批量mint NFT，批量发送token，归集NFT等等。
另外讲一下用flashbot的几个好处：
  1. 交易失败不会损失gas fee，如果你去参与NFT公售并在gas war中失败了，你不会损失gas
  2. 可以定下一个合理的可接受的gas，启动脚本后等待成交即可，当以太坊gas降低到你的设定值同时有flashbot矿工接收了你的交易，你的交易就可以成交了
使用flashbot的缺点：
  1. 交易并不一定被接受。即使你给了很高的gas fee，在某些情况下有一定概率交易仍然不会被接收，所以如果你在参与nft公售的时候非常想成功，请不要使用flashbot
  2. flashbot最多同时打包50笔交易。（当然这可以通过启动多个进程来解决）

## 脚本原理

脚本使用**flashbot**来打包发送交易，也就是说可以大量交易同时在同一个区块成交。flashbot 的原理是监听每一个区块的生成，每有一个区块被打包时都发送交易，一旦交易被接收，就可以停止发送了，同时还可以配置自己期望的 gas 费用，个人觉得在需要批量交易的场景下还是蛮好用的
这套脚本自带的是批量去 mint XEN token，首先手动生成 100 个钱包地址和助记词（这 100 个地址是在同一套助记词下的，方便后续管理），然后再手动从主钱包将钱分散到 100 个地址，最后再用 100 个地址去 mint XEN

## 脚本配置

具体需要做的配置只有 3 个文件

```
utils/transerToWallet_v2.js
index.js
.env.example
```

前两个已经在文件中给出详细注释如何配置
最后一个文件详细如下

```
PRIVATE_KEY="你的主钱包私钥（用来分钱）"
MAINNET_RPC_URL="RPC URL，自行注册一个infura的，记得要用websockets的"
ALCHEMY_KEY="如果要使用归集nft的功能，需要用到alchemy sdk，请注册alchemy并获取key"
```

**配置完成后将文件名改为`.env `才可以生效！**

## 目录结构

最终的目录结构如下

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
**注意妥善保存助记词，不要泄漏`accounts.json`和`.env`中的任何内容！！**

## 脚本使用
首先需要电脑的node环境，自行google或百度进行配置

```shell
node utils/generateWallets          👛生成n个钱包+助记词
node utils/transferToWallet_v2      💲把钱分散到n个钱包
node index                          🚀用批量钱包去mint XEN
node format 	                      📦整理钱包地址，生成一个txt文件，复制后可以直接粘贴到CryptoCell工具监控自己的XEN数量
node utils/calBalance               💰检查所有钱包共计剩余多少ether
node utils/collectNFT               🧶将NFT归集到一个钱包内

```
CryptoCell地址：https://hub.cryptocell.guru/xen-monitor/home
## Q&A
```
Q：如何判断交易成功了？
A：脚本的原理是将大量交易打包后一起发送，那么每笔交易都有自己的一个 nonce 值（可以自己搜索一下），
这个 nonce 是不能重复的，所以说交易成功后 flashbot 再次发送交易的话，会报错提示 nonce 已经存在，那么
这时你就可以确定交易已经被接收，可以去 etherscan 确认了

Q: 一次最多多少笔交易？
A：我个人测试后貌似最大 50 笔交易打包，所以如果 100 个账户的话，需要分两次完成（不会多花 gas 的）
```
## 应用案例
1. 我最近用flashbot参与了一次nft公售，这个nft是隐形发射的，所以并不知道什么时候启动，我的解决方式就是提前在服务器上用pm2挂起脚本，脚本不断的发送mint交易，即使失败交易被回滚也并不会浪费gas。

## 联系方式
wechat: foxof_eth
twitter: @xof2021 
