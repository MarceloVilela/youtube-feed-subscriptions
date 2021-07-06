import axios from 'axios';
import chalk from 'chalk';
import { StoreJsonParams, LoadJsonParams } from './debug';

const getId = (fileName = '') => {
  let id = '';
  switch (fileName) {
    case 'state': id = String(process.env.JSONBIN_ID_STATE);
      break;
    case 'feed-home': id = String(process.env.JSONBIN_ID_HOME);
      break;
    case 'feed-subs': id = String(process.env.JSONBIN_ID_SUBS);
      break;
    default: id = '';
      break;
  }

  return id;
}

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': process.env.JSONBIN_API_KEY,
};

/**
 * https://jsonbin.io/api-reference/bins/get-started
 */
const jsonbin = axios.create({
  baseURL: 'https://api.jsonbin.io/v3/b/',
  headers
});

const storeJson = async ({ data, fileName }: StoreJsonParams) => {
  const id = getId(fileName);

  try {
    await jsonbin.put(id, data);

    console.log(chalk.green('💾 The file has been saved!' + '\n'));
  } catch (error) {
    console.log(chalk.red('💾 Error on save file!' + '\n'));
  }
}

const loadJson = async ({ fileName }: LoadJsonParams) => {
  const id = getId(fileName);

  try {
    const { data } = await jsonbin.get(id);
    const { record } = data;

    console.log(chalk.green('💾 The file has been loaded!' + '\n'));

    return record;
  } catch (error) {
    console.log(chalk.red('💾 Error on load file!' + '\n'));
  }

}

export { storeJson, loadJson };
