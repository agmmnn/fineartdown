import Types from "./main.d";

import { downloadfile } from "./download";
import axios from "axios";
import { load } from "cheerio";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";

let { width, height } = { width: 3393, height: 2598 };
let ARTWORK_ID = "18758501";

// (width = 5120), (height = 3382);
// ARTWORK_ID = 25769634;

// (width = 3552), (height = 2657);
// ARTWORK_ID = 2608820;

const MAX_SQUARE_SIZE = 600;
const BASE_URL =
  "https://render.fineartamerica.com/previewhighresolutionimage.php?";
const URL_WATERMARK = "&domainUrl=%20%20%20%20%20%20%20%20%20%20";

function squareTile(actualSize: number) {
  // Calculate the power of 90 needed to scale the image to the desired size
  const power = 90;
  const numPower = actualSize / power;

  // Calculate the size of the output image, which should not exceed the maximum square size
  const outputSize =
    actualSize < MAX_SQUARE_SIZE
      ? Math.floor(actualSize / 0.9)
      : MAX_SQUARE_SIZE;

  // Calculate the size of the image to be generated on the backend
  const backendSize = Math.floor(actualSize / 0.9);

  // Calculate tiles
  const tileCount = {
    x: Math.ceil(width / actualSize),
    y: Math.ceil(height / actualSize),
  };
  const tileCountVirtual = {
    x: Math.ceil(width / backendSize),
    y: Math.ceil(height / backendSize),
  };
  const tileMod = { x: width % actualSize, y: height % actualSize };
  const tileModVirtual = { x: width % backendSize, y: height % backendSize };

  // Calculate the dimensions of the scaled image based on the actual size
  // Math.round?
  const { widthMedium, heightMedium } = {
    widthMedium: width / numPower,
    heightMedium: height / numPower,
  };

  // Calculate the gaps between tiles
  // const gapSize = Math.round(actualSize / 0.9 - actualSize);
  const gapSize = actualSize / 0.9 - actualSize;
  // const gapSize = backendSize - actualSize;

  const adjustAspect = () => {
    const aspectRatio = width / height;
    const aspectRatioMedium = widthMedium / heightMedium;
    const roundingFactor = 1e13;

    if (aspectRatio === aspectRatioMedium)
      return {
        widthMedium: widthMedium,
        heightMedium: heightMedium,
      };

    let heightMediumNew = widthMedium / aspectRatio;
    heightMediumNew =
      Math.round(heightMediumNew * roundingFactor) / roundingFactor;

    let widthMediumNew = heightMediumNew * aspectRatioMedium;
    widthMediumNew =
      Math.round(widthMediumNew * roundingFactor) / roundingFactor;

    const threshold = 1e-13;
    let diff;
    do {
      diff = Math.abs(widthMediumNew - widthMedium);
      if (diff > threshold) {
        widthMediumNew += widthMediumNew > widthMedium ? -threshold : threshold;
        heightMediumNew = widthMediumNew / aspectRatio;
      }
    } while (diff > threshold);
    const result = {
      widthMedium: widthMediumNew,
      heightMedium: heightMediumNew,
    };
    console.log(widthMedium, widthMediumNew, heightMedium, heightMediumNew);
    return result;
  };

  // Generate the URL for the tile
  const urlParams = new URLSearchParams({
    artworkid: ARTWORK_ID,
    widthmedium: adjustAspect().widthMedium.toString(),
    heightmedium: adjustAspect().heightMedium.toString(),
    x: "0",
    y: "0",
  });
  const url = BASE_URL + urlParams.toString() + URL_WATERMARK;

  const final: Types.Size = {
    actualSize,
    actualDimensions: { w: actualSize, h: actualSize },
    outputSize,
    backendSize,
    outputDimensions: { w: outputSize, h: outputSize },
    widthMedium,
    heightMedium,
    tileCount,
    tileCountVirtual,
    tileMod,
    tileModVirtual,
    gapSize,
    urlParams,
    url,
    tiles: [],
  };
  return final;
}

// randomDelay min<->max
const randomDelay = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

// sleep
const sleep = (delay: number) => new Promise((r) => setTimeout(r, delay));

/* Checkers Game: 
The backend server sends a %10 smaller version of the desired tile with %10 upscale.
request: 600px -> server:
                   1. select the 600px section
                   2. 10% upscale the slice 10% of the tile. 540px to 600px. return: 600px
So need 3 layers to fill most of the gaps between the tiles.
[layer1,layer2,layer3]

The 4th layer can be added, but this time need to make more requests to the server.
And the server does not return the image more than a certain number of requests in a certain period of time.
This time you have to put a delay between each download, which makes the total process longer.
The only solution is to use different proxy ip's.
*/

/* [(600*0.9),600,(600/0.9)]
Disadvantages: Need to upscale 600px->667px. So much float numbers on backend, gap.
Advantages: Less tiles=less requests to the server.*/
// const checkersGameArray = [540, 600, 667];

/* whole number
backend: [405, 450, 500]
gap: [40.5, 45, 50]*/
// const checkersGameArray = [364.5, 405, 450];

/* [((600*0.9)*0.9),(600*0.9),600]
I've tried many combinations and this is the best one so far.
backend: [540, 600, 666.6666666666666]
gap: [54, 60, 66.66666666666663]*/
const checkersGameArray: Array<number> = [486, 540, 600];

function checkersGame() {
  const checkerResult: Types.CheckersGame = {
    artworkId: ARTWORK_ID,
    dimensions: { w: width, h: height },
    sizes: {},
  };
  for (const size of checkersGameArray) {
    const result = squareTile(size);
    const { modX, modY } = { modX: result.tileMod.x, modY: result.tileMod.y };
    const { countX, countY } = {
      countX: result.tileCount.x,
      countY: result.tileCount.y,
    };
    const { countVX, countVY } = {
      countVX: result.tileCountVirtual.x,
      countVY: result.tileCountVirtual.y,
    };

    if (!checkerResult.sizes.hasOwnProperty(size)) {
      checkerResult.sizes[size] = { ...result, tiles: [] };
    }
    for (let i = 0; i < countVX; i++) {
      for (let j = 0; j < countVY; j++) {
        const x = Math.floor(i * result.actualSize + i * result.gapSize);
        const y = Math.floor(j * result.actualSize + j * result.gapSize);
        const coordinatesURL = { x: i * 100, y: j * 100 };
        let urlParams = result.urlParams as URLSearchParams;
        urlParams.set("x", String(coordinatesURL.x));
        urlParams.set("y", String(coordinatesURL.y));
        checkerResult.sizes[size].tiles.push({
          rowColumn: { x: i, y: j },
          coordinatesImg: { x, y },
          coordinatesURL,
          url: BASE_URL + urlParams + URL_WATERMARK,
        });
      }
    }
  }
  return checkerResult;
}

async function downloader() {
  const start = performance.now();
  const result: Types.CheckersGame = checkersGame();
  const artworkId = result.artworkId;

  const { w, h } = result.dimensions;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  for (const [sizeIndex, [sizeKey, size]] of Object.entries(result.sizes)
    .reverse()
    .entries()) {
    const tiles: Types.Tile[] = size.tiles;
    console.log(
      "Size",
      sizeIndex,
      sizeKey,
      "total tiles:",
      Object.entries(tiles).length
    );
    for (const [tileIndex, tile] of size.tiles.entries()) {
      console.log(tile);
      const filename = `${size.actualSize}_${tile.coordinatesURL.x}x${tile.coordinatesURL.y}_${artworkId}`;
      const path = artworkId + "/" + filename + ".jpg";
      console.log(
        "Tile",
        tileIndex + 1,
        "/",
        size.tiles.length,
        "in size",
        sizeKey,
        tile.rowColumn
      );
      if (!fs.existsSync(path)) {
        await downloadfile(tile.url, filename, artworkId, false, 1000, start);
        //delay for next tile
        await sleep(randomDelay(600, 990));
      } else {
        console.log("File exist. " + filename);
      }
      const img = await loadImage(path);
      let dw = sizeIndex === 0 ? size.actualSize - 1 : size.actualSize;
      let dh = sizeIndex === 0 ? size.actualSize - 1 : size.actualSize;

      const { tileCountVX, tileCountVY } = {
        tileCountVX: size.tileCountVirtual.x,
        tileCountVY: size.tileCountVirtual.y,
      };
      const { modVX, modVY } = {
        modVX: size.tileModVirtual.x,
        modVY: size.tileModVirtual.y,
      };
      if (
        tile.rowColumn.x + 1 === tileCountVX &&
        tile.rowColumn.y + 1 === tileCountVY &&
        modVX <= size.actualSize &&
        modVY <= size.actualSize
      ) {
        dw = modVX;
        dh = modVY;
        console.log("Corner:", dw, dh);
      } else if (
        tile.rowColumn.x + 1 === tileCountVX &&
        modVX <= size.actualSize
      ) {
        dw = modVX;
        console.log("Edge x:", dw, dh);
      } else if (
        tile.rowColumn.y + 1 === tileCountVY &&
        modVY <= size.actualSize
      ) {
        dh = modVY;
        console.log("Edge y:", dw, dh);
      }

      ctx.drawImage(
        img,
        tile.coordinatesImg.x,
        tile.coordinatesImg.y,
        dw === 0 ? size.actualSize : dw,
        dh === 0 ? size.actualSize : dh
      );
    }
    //delay for next size
    // await sleep(randomDelay(800, 990));
  }

  const out = fs.createWriteStream(
    artworkId + "_canvas_[" + checkersGameArray.join() + "].png"
  );
  const stream = canvas.createPNGStream({
    compressionLevel: 6,
    filters: canvas.PNG_ALL_FILTERS,
    palette: undefined,
    backgroundIndex: 0,
    resolution: undefined,
  });
  stream.pipe(out);
  out.on("finish", () =>
    console.log(
      "The PNG file was created.",
      `Total execution time: ${(performance.now() - start) / 1000} s`
    )
  );

  console.log(`Execution time: ${(performance.now() - start) / 1000} s`);
}

const getInfo = async (arg: string) => {
  const previewResult = async (id: string) =>
    await axios.get(
      "https://fineartamerica.com/showpreviewimage.php?artworkid=" + id
    ); //url.origin;

  let globalArtworkId;
  if (arg.startsWith("http")) {
    const url = new URL(arg);
    const baseUrl = url.origin + url.pathname;
    const res = await axios.get(baseUrl);
    const $ = load(res.data);
    const script = $('script:contains("globalArtworkId")').html();
    globalArtworkId = script!.match(/globalArtworkId\s*=\s*'(\d+)';/)![1];
  } else {
    globalArtworkId = arg;
  }

  const $$ = load(await previewResult(globalArtworkId).then((res) => res.data));
  const text = $$("#targetimagemessage").parent().text();
  const sizeMatch = text.match(/(\d+)\s*x\s*(\d+)/)!;
  width = parseInt(sizeMatch[1]);
  height = parseInt(sizeMatch[2]);

  console.log(width, height);

  ARTWORK_ID = globalArtworkId;
  console.log(ARTWORK_ID, width, height);
};

const arg = process.argv[2];
if (arg) {
  getInfo(arg).then(() => downloader());
} else {
  downloader();
}
