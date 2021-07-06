import chalk from "chalk";

export interface StoreImageParams {
  base64: string;
  fileName: string;
}

const storeImage = ({ base64, fileName }: StoreImageParams) => {
  console.log(chalk.green('storeImage-debug'));

  console.table([
    base64.slice(0, 20),
    fileName
  ]);

  console.log('\n');
};

export { storeImage };
