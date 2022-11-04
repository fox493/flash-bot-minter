import fs from "fs"

const addresses = JSON.parse(fs.readFileSync("accounts.json")).accounts
let pubs = []
for (let add of addresses) {
  pubs.push(add.pub)
}
const data = pubs.join("\n")
fs.writeFile("accounts.txt", data, () => {})
