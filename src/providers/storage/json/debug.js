import chalk from "chalk";

const storeJson = async ({ data, fileName }) => {
  console.log(chalk.green('storeJson-debug'));

  console.table([
    fileName,
    JSON.stringify(data, null, 2).slice(0, 100),
  ]);

  console.log('\n');
}

const loadJson = async ({ fileName }) => {
  console.log(chalk.green('loadJson-debug'));

  console.table([
    fileName,
  ]);

  console.log('\n');
}

export { storeJson, loadJson };
