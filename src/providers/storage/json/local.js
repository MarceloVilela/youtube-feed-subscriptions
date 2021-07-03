import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

const JSON_PATH = path.join('tmp', 'json_data');

const today = new Date();
const date_time = today.toISOString().substring(0, 19).replace(/:/g, '-').replace('T', '_');

const storeJson = ({ data, fileName }) => {
  const fileNameDetailed = fileName !== 'state'
    ? path.join(JSON_PATH, `${process.env.USER}_${fileName}_${date_time}.json`)
    : path.join(JSON_PATH, `${process.env.USER}_${fileName}.json`);

  try {
    writeFileSync(
      fileNameDetailed,
      JSON.stringify(data)
    );

    console.log(chalk.green('💾 The file has been saved!' + '\n'));
  } catch (error) {
    console.log(chalk.red('💾 Error on save file!' + '\n'));
  }
};

const loadJson = async ({ fileName }) => {
  const fileNameDetailed = fileName !== 'state'
    ? path.join(JSON_PATH, `${process.env.USER}_${fileName}_${date_time}.json`)
    : path.join(JSON_PATH, `${process.env.USER}_${fileName}.json`);

  try {
    const buffer = readFileSync(fileNameDetailed);
    const data = JSON.parse(buffer.toString());

    console.log(chalk.green('💾 The file has been loaded!' + '\n'));

    return data;
  } catch (error) {
    console.log(chalk.red('💾 Error on load file!' + '\n'));
  }
}

export { storeJson, loadJson };
