import { firefox, Page } from "playwright-firefox";
import {
  storeImageImgur,
  storeImageLocal,
  storeImageDebug,
} from "../providers/storage/image";

const today = new Date();
const getDateTime = () =>
  today.toISOString().substring(0, 19).replace(/:/g, "-").replace("T", "_");

const storeImage = {
  imgur: storeImageImgur,
  local: storeImageLocal,
  debug: storeImageDebug,
};

const storeScreenshot = async (page: Page, fileName: string) => {
  const storeMethod = String(process.env.STORE_IMG) as keyof typeof storeImage;

  const buffer = await page.screenshot();
  const base64 = buffer.toString("base64");
  return await storeImage[storeMethod]({
    base64,
    fileName,
  });
};

const screenshot = async (url: string, positionsY: number[]) => {
  console.log(`function screenshot | ${url} | ${positionsY.join(",")}`);

  const browser = await firefox.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({
    colorScheme: "dark",
    viewport: {
      width: 1152,
      height: 950,
    },
  });
  await page.goto(url);
  await page.waitForTimeout(1000);

  let urls = [];

  for (let i = 0; i < positionsY.length; i++) {
    const y = positionsY[i];
    console.log("pos", y);

    await page.evaluate((y) => {
      window.scrollTo(0, Number(y));
    }, y);
    console.log("page acessed");
    urls.push(await storeScreenshot(page, getDateTime() + i));
  }

  await browser.close();

  return urls;
};

export { screenshot };
