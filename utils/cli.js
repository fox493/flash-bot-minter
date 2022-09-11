import inquirer from "inquirer"

export const transferConfirm = async (wallet, balance, amount_per_tx, total_amount) => {
  let ans = await inquirer.prompt([
    {
      name: "confirm",
      type: "confirm",
      default: false,
      message: `Transfering from ${wallet}, balance: ${balance}\n`
    },
  ])
}
