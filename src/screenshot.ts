// @ts-ignore
import dotenv from "dotenv";
import chalk from "chalk";

import { screenshot } from "./modules/screenshot";
import { getStoreJson } from "./providers/storage";

dotenv.config();

const SCREENSHOT_URL = process.env.SCREENSHOT_URL || "https://devfinder.vercel.app";
const SCREENSHOT_POSITIONS_Y = (process.env.SCREENSHOT_POSITIONS_Y || "80,900,1700")
  .split(",")
  .map(Number);

const run = async () => {
  const storeJson = getStoreJson();

  console.log(chalk.cyan(`▶ screenshot (${SCREENSHOT_URL})`));
  const urls = await screenshot(SCREENSHOT_URL, SCREENSHOT_POSITIONS_Y);

  await storeJson({
    fileName: "screenshots",
    data: { urls, generatedAt: new Date().toISOString() },
  });
};

run()
  .then(() => {
    console.log(chalk.green("✅ screenshot task completed"));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red("❌ screenshot task failed"));
    console.error(error);
    process.exit(1);
  });
