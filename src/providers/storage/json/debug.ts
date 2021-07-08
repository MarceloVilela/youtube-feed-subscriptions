import chalk from "chalk";

export interface StoreJsonParams {
  data: object;
  fileName: string;
}

export interface LoadJsonParams {
  fileName: string;
}

const storeJson = async ({ data, fileName }: StoreJsonParams) => {
  console.log(chalk.green('storeJson-debug'));

  console.table([
    fileName,
    JSON.stringify(data, null, 2).slice(0, 100),
  ]);

  console.log('\n');
}

const loadJson = async ({ fileName }: LoadJsonParams) => {
  console.log(chalk.green('loadJson-debug'));

  console.table([
    fileName,
  ]);

  console.log('\n');
}

export { storeJson, loadJson };
