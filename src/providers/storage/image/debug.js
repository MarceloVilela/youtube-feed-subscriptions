import chalk from "chalk";

const storeImage = ({ base64, fileName }) => {
  console.log(chalk.green('storeImage-debug'));

  console.table([
    base64.slice(0, 20),
    fileName
  ]);

  console.log('\n');
};

export { storeImage };
