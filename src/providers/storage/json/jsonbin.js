import axios from 'axios';
import chalk from 'chalk';

const fileNameId = {
  'state': process.env.JSONBIN_ID_STATE,
  'feed-home': process.env.JSONBIN_ID_HOME,
  'feed-subs': process.env.JSONBIN_ID_SUBS,
};

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

const storeJson = async ({ data, fileName }) => {
  const id = fileNameId[fileName] ? fileNameId[fileName] : '';

  try {
    await jsonbin.put(id, data);

    console.log(chalk.green('💾 The file has been saved!' + '\n'));
  } catch (error) {
    console.log(chalk.red('💾 Error on save file!' + '\n'));
  }
}

const loadJson = async ({ fileName }) => {
  const id = fileNameId[fileName] ? fileNameId[fileName] : '';

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
