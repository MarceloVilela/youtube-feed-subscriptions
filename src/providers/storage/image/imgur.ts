import imgur from 'imgur';
import chalk from 'chalk';
import { StoreImageParams } from './debug';

const today = new Date();
const date_time = today.toISOString().substring(0, 19).replace(/:/g, '-').replace('T', '_');

imgur.setCredentials(process.env.IMGUR_USER, process.env.IMGUR_PASS, process.env.IMGUR_CLIENT_ID);

const storeImage = async ({ base64, fileName }: StoreImageParams) => {
  const response = await imgur.uploadBase64(
    base64,
    '',
    `${fileName}_${date_time}_${process.env.USER}`
  );

  if (response.link) {
    console.log(chalk.green(`💾 The image has been saved! | ${fileName} => ${response.link}` + '\n'));
  }
  else {
    console.log(chalk.red('💾 Error on save image!' + '\n'));
  }

  return String(response.link);
}

export { storeImage };
