import { firefox, Page, LaunchOptions, PageScreenshotOptions } from 'playwright-firefox';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const USER = String(process.env.USER);
const PASS = String(process.env.PASS);
const ITERATION_NUM = Number(process.env.ITERATION_NUM);
const TIMEOUT_SHORT = Number(process.env.TIMEOUT_SHORT);
const TIMEOUT_LONG = Number(process.env.TIMEOUT_LONG);

type Video = {
  title: string;
  url: string | null;
  channel_name: string;
  channel_url: string | null;
  channel_icon: string | null;
  thumbnail: string | null;
  view_num: string;
  date: string;
};

type StoreJsonParams = {
  fileName: string;
  data: object;
}

type LoadJsonParams = {
  fileName: string;
}

type StoreImageParams = {
  fileName: string;
  base64: string;
}

type StoreScreenshotParams = {
  page: Page;
  fileName: string;
  options?: PageScreenshotOptions;
}

type StorageState = {
  cookies?: Array<{
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }>;

  origins?: Array<{
    origin: string;
    localStorage: Array<{
      name: string;
      value: string;
    }>;
  }>;
};

type FileOperations = {
  storeJson: ({ fileName, data }: StoreJsonParams) => void;
  loadJson: ({ fileName }: LoadJsonParams) => void;
  storeImage: ({ fileName, base64: string }: StoreImageParams) => void;
}

type InitializeParams = {
  browserOptions: LaunchOptions;
  storageState: StorageState;
  fileOperations: FileOperations;
}

class YoutubeScrape {
  page = {} as Page;
  storeJson: ({ }: StoreJsonParams) => void;
  loadJson: ({ }: LoadJsonParams) => void;
  storeImage: ({ }: StoreImageParams) => void;

  initialize = async ({ browserOptions, storageState, fileOperations }: InitializeParams) => {
    console.log(chalk.cyan('initialize'));

    const browser = await firefox.launch(browserOptions);

    const page = await browser.newPage({
      storageState,

      colorScheme: 'dark',

      viewport: {
        width: 1200,
        height: 1000,
      },
    });

    this.page = page;
    this.storeJson = fileOperations.storeJson;
    this.loadJson = fileOperations.loadJson;
    this.storeImage = fileOperations.storeImage;

    console.log(chalk.cyan('initialize - storageState.origins'));
    console.table(storageState && storageState.origins ? storageState.origins : '');
    console.log('\n');
  };

  loginWhitUserPass = async () => {
    console.log(chalk.cyan('loginWhitUserPass'));
    const page = this.page;

    await page.goto('https://accounts.google.com/signin/v2/identifier');

    //Go to sign in button
    await page.waitForTimeout(TIMEOUT_SHORT);
    await page.waitForSelector('#identifierId');
    await page.type('#identifierId', USER, { delay: 70 });
    console.log('Typing in the USERs name...');

    //Clicking the Next button
    await page.waitForTimeout(TIMEOUT_SHORT);
    await this.storeScreenshot({ page, fileName: 'login-type-user' });
    await page.waitForSelector('#identifierNext');
    await page.click('#identifierNext');
    console.log('Clicking the Next button...');

    //Type in the password, wait 2 seconds since form take while to load
    console.log('Typing in the password...');
    await page.waitForTimeout(TIMEOUT_LONG);
    await this.storeScreenshot({ page, fileName: 'login-type-pass' });
    await page.waitForSelector('#password');
    await page.type('#password', PASS, { delay: 80 });

    //Sending the Password
    await page.waitForTimeout(TIMEOUT_SHORT);
    await this.storeScreenshot({ page, fileName: 'login-sending' });
    await page.waitForSelector('#passwordNext');
    await page.click('#passwordNext');
    console.log('🖱 :Clicking the Send password button...');

    await page.waitForTimeout(TIMEOUT_LONG);

    const state = await page.context().storageState();
    this.storeJson({ fileName: 'state', data: state });
  };

  feedSubscriptions = async (): Promise<Video[]> => {
    console.log(chalk.cyan('feedSubscriptions'));

    const page = this.page;

    const accountName = USER;

    await page.goto('https://www.youtube.com/feed/subscriptions');

    await page.waitForSelector("#content");
    console.log(chalk.cyan("🔨 Scraper Starting for : " + accountName + " ——— waiting " + TIMEOUT_LONG + " miliseconds " + '\n'));
    await page.waitForTimeout(TIMEOUT_LONG);

    //——Making screenshot of each file

    //make a photo based on the iteraction count 
    await this.storeScreenshot({ page, fileName: 'feed-subs' });

    //$$ works exactly as a document.querySelectorAll() would in the browser console
    let videoArray = await page.$$('.ytd-grid-video-renderer');

    let videos = <Video[]>[];
    let iteration = 0;

    for (let videoElement of videoArray) {

      var video = <Video>{};
      let youtube_url = "https://www.youtube.com";

      try {
        //.getAttribute gets elements within the class in HTML
        video.title = await videoElement.$eval('#video-title', element => (element as HTMLParagraphElement).innerText);
        video.url = await videoElement.$eval('#video-title', element => element.getAttribute('href'));
        video.url = `${youtube_url}${video.url}`;
        video.channel_name = await videoElement.$eval('a[class="yt-simple-endpoint style-scope yt-formatted-string"]', element => (element as HTMLParagraphElement).innerText);
        video.channel_url = await videoElement.$eval('a[class="yt-simple-endpoint style-scope yt-formatted-string"]', element => element.getAttribute('href'));
        video.channel_url = `${youtube_url}${video.channel_url}`;
        //video.channel_icon = await videoElement.$eval('a[class="yt-simple-endpoint style-scope ytd-rich-grid-video-renderer"] img[class="style-scope yt-img-shadow"]', element => element.getAttribute('src'));
        video.thumbnail = await videoElement.$eval('img[class="style-scope yt-img-shadow"]', element => element.getAttribute('src'));
        //video.viewnum = await videoElement.$eval('span[class="style-scope ytd-video-meta-block"]', element => element.innerText);
        //video.date = await videoElement.$eval('div[class="style-scope ytd-video-meta-block"]', element => element.innerText);
        //video.date = video.date.split("\n")[2];

        if (video.thumbnail) {
          videos.push(video);
        } else {
          //console.log(`‼️ Error occured during scraping. ${video.title} don't have thumb`);
          continue;
        }

      }
      catch (e) {
        //console.log("‼️ Error occured during scraping" + e);
        continue;
      }

      console.log(chalk.cyan(`Listed video: ${video.title}`));

      //Decides how many time it loops through, definetely a better way to write this.
      iteration++
      if (iteration == ITERATION_NUM) {
        iteration = 0;
        break;
      }
    }

    this.storeJson({ fileName: 'feed-subs', data: videos });

    return videos;
  };

  feedHome = async (): Promise<Video[]> => {
    console.log(chalk.cyan('feedHome'));

    const page = this.page;

    const accountName = USER;

    await page.goto('https://www.youtube.com');

    await page.waitForSelector("#content");
    console.log(chalk.cyan("🔨 Scraper Starting for : " + accountName + " ——— waiting " + TIMEOUT_LONG + " miliseconds " + '\n'));
    await page.waitForTimeout(5000);

    //——Making screenshot of each file

    //make a photo based on the iteraction count 
    await this.storeScreenshot({ page, fileName: 'feed-home' });

    //$$ works exactly as a document.querySelectorAll() would in the browser console
    let videoArray = await page.$$('#contents .ytd-rich-grid-renderer');

    let videos = <Video[]>[];
    let iteration = 0;

    for (let videoElement of videoArray) {
      var video = <Video>{};
      let youtube_url = "https://www.youtube.com";

      try {
        //.getAttribute gets elements within the class in HTML
        video.title = await videoElement.$eval('#video-title', element => (element as HTMLParagraphElement).innerText);
        video.url = await videoElement.$eval('h3[class*="ytd-rich-grid-media"] a[class*="ytd-rich-grid-media"]', element => element.getAttribute('href'));
        video.url = `${youtube_url}${video.url}`;
        video.channel_name = await videoElement.$eval('a[class*="yt-formatted-string"]', element => (element as HTMLParagraphElement).innerText);
        video.channel_url = await videoElement.$eval('a[class*="yt-formatted-string"]', element => element.getAttribute('href'));
        video.channel_url = `${youtube_url}${video.channel_url}`;
        video.channel_icon = await videoElement.$eval('a[class*="ytd-rich-grid-media"] img[class*="yt-img-shadow"]', element => element.getAttribute('src'));
        video.thumbnail = await videoElement.$eval('img[class*="yt-img-shadow"]', element => element.getAttribute('src'));
        video.view_num = await videoElement.$eval('span[class*="ytd-video-meta-block"]', element => (element as HTMLParagraphElement).innerText);
        video.date = await videoElement.$eval('div[class*="ytd-video-meta-block"]', element => (element as HTMLParagraphElement).innerText);
        video.date = video.date.split("\n")[2];

        if (video.thumbnail) {
          videos.push(video);
        } else {
          //console.log(`‼️ Error occured during scraping. ${video.title} don't have thumb`);
          continue;
        }

      }
      catch (e) {
        //console.log("‼️ Error occured during scraping" + e);
        continue;
      }

      console.log(chalk.cyan(`Listed video: ${video.title}`));

      //Decides how many time it loops through, definetely a better way to write this.
      iteration++
      if (iteration == ITERATION_NUM) {
        iteration = 0;
        break;
      }
    }

    this.storeJson({ fileName: 'feed-home', data: videos });

    return videos;
  };

  storeScreenshot = async ({ page, fileName = 'feed-home', options }: StoreScreenshotParams) => {
    const buffer = await page.screenshot(
      //options
    );
    const base64 = buffer.toString('base64');

    this.storeImage({ base64, fileName });
  };

};

const youtubeScrape = new YoutubeScrape();

export { youtubeScrape };