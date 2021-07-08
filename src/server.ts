import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { youtubeScrape } from './main';
import { getStoreImage, getStoreJson, getLoadJson } from './providers/storage';
import chalk from 'chalk';

dotenv.config();

const app = express();
app.use(cors());
const browserOptions = { args: ["--no-sandbox"] };

app.get('/feed/subscriptions', async (request: Request, response: Response) => {
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
      await youtubeScrape.loginWhitUserPass();
    }

    data = await youtubeScrape.feedSubscriptions();
    await youtubeScrape.end();

    console.log(chalk.bgGreen('route[success] /feed/subscriptions'));
    return response.json(data);
  } catch (error) {
    console.log(chalk.bgRed('route[error] /feed/subscriptions'));
    console.log(error);
    await youtubeScrape.end();
    return response.status(500).json({ error: error.message });
  }

});

app.get('/feed/home', async (request: Request, response: Response) => {
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
    await youtubeScrape.end();

    console.log(chalk.bgGreen('route[success] /feed/home'));
    return response.json(data);
  } catch (error) {
    console.log(chalk.bgRed('route[error] /feed/home'));
    console.log(error);
    await youtubeScrape.end();
    return response.status(500).json({ error: error.message });
  }

});

app.get('/', async (request: Request, response: Response) => {
  console.log(chalk.bgGreen('route /'));

  return response.json({
    appName: `youtube-feed-subscriptions`,
    routes: [
      { '/feed/subscriptions': 'retrieve your own Youtube feed subscriptions (https://www.youtube.com/feed/subscriptions)' },
      { '/feed/home': 'retrieve your own Youtube homepage results (https://www.youtube.com)' },
    ]
  })
});

app.listen(process.env.PORT || 3333);