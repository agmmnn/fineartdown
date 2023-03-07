import * as https from "https";
import { IncomingMessage } from "http";

import fs from "fs";

export async function downloadfile(
  url: string,
  filename: string,
  folder: string,
  delay = false,
  delayms = 1000,
  start: number
) {
  const dir = "./" + folder;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const response: IncomingMessage = await new Promise((resolve, reject) => {
    https.get(url, resolve).on("error", reject);
  });

  if (
    response.statusCode === 200 &&
    response.headers["content-type"]!.startsWith("image")
  ) {
    const file = fs.createWriteStream(dir + "/" + filename + ".jpg"); //content-type: image/jpeg
    await new Promise((resolve) => {
      response.pipe(file).on("finish", resolve);
    });
    // downloaded content is an image, close filestream
    file.end();
    if (delay) {
      console.log(
        `Download completed. Delay until next download: ${
          delayms / 1000
        } seconds.`
      );
      await new Promise((resolve) => setTimeout(resolve, delayms));
    } else {
      console.log("Download completed. " + filename);
    }
  } else {
    // downloaded content is not an image, retry after specified delay
    console.log(
      `Download failed! Retrying in ${(delayms / 1000) * 6} seconds...`
    );
    console.log(`Execution time: ${(performance.now() - start) / 1000} s`);
    await new Promise((resolve) => setTimeout(resolve, delayms * 6));
    await downloadfile(url, filename, folder, delay, delayms, start);
  }
}
