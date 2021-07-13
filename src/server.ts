import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';

import { youtubeScrape } from './main';
import { getStoreImage, getStoreJson, getLoadJson } from './providers/storage';
import swaggerFile from '../swagger_output.json';

dotenv.config();

const app = express();
app.use(cors());

const browserOptions = { args: ["--no-sandbox"] };
let width = 1200;
let height = 1000;
let iterationNum = 10;

app.use(
  '/doc',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, undefined, { docExpansion: "none", persistAuthorization: true })
)

app.get('/feed/subscriptions', async (request: Request, response: Response) => {
  try {
    console.log(chalk.bgGreen('route[begin] /feed/subscriptions'));

    const { auth_method } = request.query;
    const widthQuery = Number(request.query.width);
    const heightQuery = Number(request.query.height);
    const iterationQuery = Number(request.query.iteration);
    let data = {};


    width = (widthQuery >= 768 && widthQuery <= 3840) ? widthQuery : width;
    height = (heightQuery >= 768 && heightQuery <= 3840) ? heightQuery : height;
    iterationNum = (iterationQuery >= 10 && iterationQuery <= 50) ? iterationQuery : iterationNum;
    const state = auth_method === 'stored' ? await getLoadJson()({ fileName: 'state' }) : '';

    await youtubeScrape.initialize({
      browserOptions,
      width,
      height,
      storageState: state,
      fileOperations: {
        storeJson: getStoreJson(),
        storeImage: getStoreImage(),
        loadJson: getLoadJson(),
      },
      iterationNum
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
    const widthQuery = Number(request.query.width);
    const heightQuery = Number(request.query.height);
    const iterationQuery = Number(request.query.iteration);
    let data = {};

    width = (widthQuery >= 768 && widthQuery <= 3840) ? widthQuery : width;
    height = (heightQuery >= 768 && heightQuery <= 3840) ? heightQuery : height;
    iterationNum = (iterationQuery >= 10 && iterationQuery <= 50) ? iterationQuery : iterationNum;
    const state = auth_method === 'stored' ? await getLoadJson()({ fileName: 'state' }) : {};
    await youtubeScrape.initialize({
      browserOptions,
      width,
      height,
      storageState: state,
      fileOperations: {
        storeJson: getStoreJson(),
        storeImage: getStoreImage(),
        loadJson: getLoadJson(),
      },
      iterationNum
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

app.get('/feed/channel', async (request: Request, response: Response) => {
  try {
    console.log(chalk.bgGreen('route[begin] /feed/channel'));

    const { auth_method, url } = request.query;
    const widthQuery = Number(request.query.width);
    const heightQuery = Number(request.query.height);
    const iterationQuery = Number(request.query.iteration);
    let data = {};

    width = (widthQuery >= 768 && widthQuery <= 3840) ? widthQuery : width;
    height = (heightQuery >= 768 && heightQuery <= 3840) ? heightQuery : height;
    iterationNum = (iterationQuery >= 10 && iterationQuery <= 50) ? iterationQuery : iterationNum;
    const state = auth_method === 'stored' ? await getLoadJson()({ fileName: 'state' }) : {};
    await youtubeScrape.initialize({
      browserOptions,
      width,
      height,
      storageState: state,
      fileOperations: {
        storeJson: getStoreJson(),
        storeImage: getStoreImage(),
        loadJson: getLoadJson(),
      },
      iterationNum
    });

    if (auth_method === 'user-pass') {
      await youtubeScrape.loginWhitUserPass();
    }

    data = await youtubeScrape.feedChannel(url);
    await youtubeScrape.end();

    console.log(chalk.bgGreen('route[success] /feed/channel'));
    return response.json(data);
  } catch (error) {
    console.log(chalk.bgRed('route[error] /feed/channel'));
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
      { '/feed/channel': 'Retrieve results from a youtube channel (https://www.youtube.com/c/VEVO)' }
    ]
  })
});

app.listen(process.env.PORT || 3333);