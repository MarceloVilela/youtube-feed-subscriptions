import express from 'express';
import dotenv from 'dotenv';

import { youtubeScrape } from './index.js';
import { getStoreImage, getStoreJson, getLoadJson } from './providers/storage/index.js'
import chalk from 'chalk';

dotenv.config();

const app = express();
const browserOptions = { args: ["--no-sandbox"] };

app.get('/feed/subscriptions', async (request, response) => {
  try {
    console.log(chalk.bgGreen('route[begin] /feed/subscriptions'));

    const { auth_method } = request.query;
    let data = {};

    const state = auth_method === 'stored' ? await getLoadJson()({ fileName: 'state' }) : '';
    await youtubeScrape.initialize({
      browserOptions,
      storageState: state,
      fileOperations: {
        storeJson: getStoreJson(),
        storeImage: getStoreImage(),
        loadJson: getLoadJson(),
      }
    });

    if (auth_method === 'user-pass') {
      const page = await youtubeScrape.loginWhitUserPass();
    }

    data = await youtubeScrape.feedSubscriptions();

    console.log(chalk.bgGreen('route[success] /feed/subscriptions'));
    return response.json(data);
  } catch (error) {
    console.log(chalk.bgRed('route[error] /feed/subscriptions'));
    console.log(error);
    return response.status(500).json({ error: error.message });
  }

});

app.get('/feed/home', async (request, response) => {
  try {
    console.log(chalk.bgGreen('route[begin] /feed/home'));

    const { auth_method } = request.query;
    let data = {};

    const state = auth_method === 'stored' ? await getLoadJson()({ fileName: 'state' }) : {};
    await youtubeScrape.initialize({
      browserOptions,
      storageState: state,
      fileOperations: {
        storeJson: getStoreJson(),
        storeImage: getStoreImage(),
        loadJson: getLoadJson(),
      }
    });

    if (auth_method === 'user-pass') {
      await youtubeScrape.loginWhitUserPass();
    }

    data = await youtubeScrape.feedHome();

    console.log(chalk.bgGreen('route[success] /feed/home'));
    return response.json(data);
  } catch (error) {
    console.log(chalk.bgRed('route[error] /feed/home'));
    console.log(error);
    return response.status(500).json({ error: error.message });
  }

});

app.listen(process.env.PORT || 3333);