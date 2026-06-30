// @ts-ignore
import dotenv from "dotenv";
import chalk from "chalk";

import { youtubeScrape } from "./main";
import { getStoreImage, getStoreJson, getLoadJson } from "./providers/storage";

dotenv.config();

const WIDTH = Number(process.env.VIEWPORT_WIDTH) || 1920;
const HEIGHT = Number(process.env.VIEWPORT_HEIGHT) || 1080;
const ITERATION_NUM = Number(process.env.ITERATION_NUM) || 50;
const CHANNEL_URL = process.env.CHANNEL_URL;
const browserOptions = { headless: process.env.HEADLESS === "true" };

// FEEDS=subscriptions,home,channel  (default: subscriptions,home)
const FEEDS = (process.env.FEEDS || "subscriptions,home")
  .split(",")
  .map((f) => f.trim());

const run = async () => {
  const state = await getLoadJson()({ fileName: "state" });

  const fileOperations = {
    storeJson: getStoreJson(),
    storeImage: getStoreImage(),
    loadJson: getLoadJson(),
  };

  await youtubeScrape.initialize({
    browserOptions,
    width: WIDTH,
    height: HEIGHT,
    storageState: state,
    fileOperations,
    iterationNum: ITERATION_NUM,
  });

  try {
    if (FEEDS.includes("subscriptions")) {
      console.log(chalk.cyan("▶ feed: subscriptions"));
      await youtubeScrape.feedSubscriptions();
    }

    if (FEEDS.includes("home")) {
      console.log(chalk.cyan("▶ feed: home"));
      await youtubeScrape.feedHome();
    }

    if (FEEDS.includes("channel")) {
      if (!CHANNEL_URL) throw new Error("FEEDS inclui 'channel' mas CHANNEL_URL não está definido");
      console.log(chalk.cyan(`▶ feed: channel (${CHANNEL_URL})`));
      await youtubeScrape.feedChannel(CHANNEL_URL);
    }
  } finally {
    await youtubeScrape.end();
  }
};

run()
  .then(() => {
    console.log(chalk.green("✅ task completed"));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red("❌ task failed"));
    console.error(error);
    process.exit(1);
  });
