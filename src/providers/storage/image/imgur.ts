// @ts-ignore
import { ImgurClient } from "imgur";
import chalk from "chalk";
import { StoreImageParams } from "./debug";

const today = new Date();
const date_time = today
  .toISOString()
  .substring(0, 19)
  .replace(/:/g, "-")
  .replace("T", "_");

const imgur = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });

const storeImage = async ({ base64, fileName }: StoreImageParams) => {
  const response = await imgur.upload({
    image: base64,
    title: "",
    description: `${fileName}_${date_time}_${process.env.USER}`,
    type: "base64",
  });

  if (response.data.link) {
    console.log(
      chalk.green(
        `💾 The image-imgur has been saved! | ${fileName} => ${response.data.link}\n`,
      ),
    );
  } else {
    console.log(chalk.red(`💾 Error on save image! | ${fileName}\n`));
  }

  return String(response.data.link);
};

export { storeImage };
