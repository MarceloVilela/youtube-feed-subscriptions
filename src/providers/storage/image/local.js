import path from 'path';
import { writeFileSync } from 'fs';
import chalk from 'chalk';

const SCREEN_PATH = path.join('tmp', 'screenshot');

const today = new Date();
const date_time = today.toISOString().substring(0, 19).replace(/:/g, '-').replace('T', '_');

const format = base64 => base64.replace(/^data:image\/\w+;base64,/, '');

const storeImage = ({ base64, fileName }) => {
  try {
    writeFileSync(
      path.join(SCREEN_PATH, `${process.env.USER}_${fileName}_${date_time}.jpg`),
      format(base64), { encoding: 'base64' },
    );

    console.log(chalk.green('💾 The image has been saved!' + '\n'));
  } catch (error) {
    console.log(chalk.red('💾 Error on save image!' + '\n'));
  }
};

export { storeImage };
