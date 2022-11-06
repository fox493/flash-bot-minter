# flash-bot-minter

Use bulk accounts to mint NFT through the flash bot.

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
MAINNET_RPC_URL=''RPC URL，自行注册一个infura的，记得要用websockets的"
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
├── utils
│   ├── calBalance.js
│   ├── generateWallets.js
│   └── transferToWallet_v2.js
└── yarn.lock
```

## 脚本使用

```shell
node utils/generateWallets    生成n个钱包+助记词
node utils/transferToWallet_v2     把钱分散到n个钱包
node index     用批量钱包去mint XEN
node format 	整理钱包地址，生成一个txt文件，复制后可以直接粘贴到CryptoCell工具监控自己的XEN数量
node utils/calBalance 检查所有钱包共计剩余多少ether

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