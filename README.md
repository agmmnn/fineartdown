![](https://i.imgur.com/fjyFiqX.png)

# FineArtDown

Download full size images from **[Fine Art America](https://fineartamerica.com/)**, **[Conde Nast Store](https://condenaststore.com/)**, **[Photos.com](https://photos.com/)** and **[Pixels.com](https://pixels.com/)**. You can check results in the _[Results Gallery](./Gallery.md)_.

## Usage

1. Download the executable from [Releases](https://github.com/agmmnn/fineartdown/releases).
1. Open your terminal in the path where the executable file is located.
1. Run the command: `./fineartdown-[your-os] <url>`

```
> ./fineartdown-win https://fineartamerica.com/featured/dancing-octopus-barathieu-gabriel.html
```

### From npm

```
npm install -g fineartdown

fineartdown <url or artworkid>
```

### Or run locally:

```
gh repo clone agmmnn/fineartdown
cd fineartdown
pnpm i

pnpm fineartdown <url or artworkid>
```

## How it works?

The backend server sends a 10% smaller slice of the requested tile with 10% upscale.

- User: Request: 600px.
- Server: Send 10% less slice of the user's selection, upscaled by 10%. Response: 540px to 600px.

[![](https://i.imgur.com/QH37Zvn.png)](https://fineartamerica.com/featured/saint-tropez-boucherie-slim-aarons.html)

So we need 3 layers to fill most of the gaps between the tiles.
[layer1, layer2, layer3]

A 4th layer can be added, but this requires more requests to the server. And the server does not return the image more than a certain number of requests in a certain period of time. This time we have to put a delay between each download, which makes the total process longer. Using different proxy ip's can be a solution.

[![](https://user-images.githubusercontent.com/16024979/223557774-b2622c6e-8c4c-45e1-919d-1c3487f4eaf2.png)](https://fineartamerica.com/featured/saint-tropez-boucherie-slim-aarons.html)

- [540, 600, 667] = [(600\*0.9),600,(600/0.9)] : Disadvantages: Need to upscale 600px->667px. So much float numbers in backend and gap numbers. Advantages: Less tiles=less requests to the server.

- [486, 540, 600] = [((600\*0.9)\*0.9),(600\*0.9),600] : I've tried many combinations and this is the best one so far.

> You can make calculations using the [calculator project](./calculator-project/).

## Known Problems:

### Gaps Between Tiles:

There are still gaps between tiles. Because 3 layers cannot cover the whole picture. As I mentioned before, adding the 4th layer takes a lot of time. _Different layer sizes or different image sizes create different patterns._

1. The first type of gap is a rectangular gap caused by the layers not covering the entire surface.

![ApplicationFrameHost_gi2wJ9xWLc](https://user-images.githubusercontent.com/16024979/223570301-af983e27-7ae8-4fc7-861d-49b33f9ff82a.png)

2. The second type of gap is caused by downsizing the 600px layer to 599. Because the server is actually sending 1 pixel lower probably due to the decimal values widthmedium and heightmedium. (it took me a long time to figure it out)

![ApplicationFrameHost_94IWLMzX2R](https://user-images.githubusercontent.com/16024979/223570295-baa7c330-8363-4384-af4d-e4880a7eb9fe.png)

This can be solved with the Healing Brush Tool in Photoshop.

### Limited Request to Server

The server sends the content "---" instead of the image after a certain number of requests within a certain period of time. Therefore, I added a rule to the download function that if it fails, it retries after a certain delay. That's why it takes longer to download an image.

## Results

> You can find more results in the [Results Gallery](./Gallery.md).

[![](https://i.imgur.com/0hbCsxz.jpeg)](https://fineartamerica.com/featured/models-sitting-on-sand-dunes-clifford-coffin.html)
[![](https://i.imgur.com/TfCArU9.jpeg)](https://fineartamerica.com/featured/the-vision-of-the-valley-of-dry-bones-gustave-dore.html)
