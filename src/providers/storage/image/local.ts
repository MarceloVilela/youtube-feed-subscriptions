import path from "path";
import { writeFile } from "fs/promises";
import chalk from "chalk";
import { StoreImageParams } from "./debug";

const SCREEN_PATH = path.join("tmp", "screenshot");

const today = new Date();
const date_time = today
  .toISOString()
  .substring(0, 19)
  .replace(/:/g, "-")
  .replace("T", "_");

const format = (base64: string) =>
  base64.replace(/^data:image\/\w+;base64,/, "");

const storeImage = async ({ base64, fileName }: StoreImageParams) => {
  try {
    const pathFile = path.join(
      SCREEN_PATH,
      `${process.env.USER}_${fileName}_${date_time}.jpg`,
    );
    await writeFile(pathFile, format(base64), { encoding: "base64" });

    console.log(chalk.green("💾 The image has been saved!" + "\n"));
    return pathFile;
  } catch (error) {
    console.log(chalk.red("💾 Error on save image!" + "\n"));
  }
};

export { storeImage };
