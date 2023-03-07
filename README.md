# FineArtDown

Download full size images from [Fine Art America](https://fineartamerica.com/), [Conde Nast Store](https://condenaststore.com/), [Photos.com](https://photos.com/) and [Pixels.com](https://pixels.com/). You can check results in the [Results Gallery](./Gallery.md).

## Usage

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

- [540, 600, 667] = [(600*0.9),600,(600/0.9)] : Disadvantages: Need to upscale 600px->667px. So much float numbers in backend and gap numbers. Advantages: Less tiles=less requests to the server.

- [486, 540, 600] = [((600*0.9)*0.9),(600*0.9),600] : I've tried many combinations and this is the best one so far.

## Results

> You can find more results in the [Results Gallery](./Gallery.md).

[![](https://i.imgur.com/0hbCsxz.jpeg)](https://fineartamerica.com/featured/models-sitting-on-sand-dunes-clifford-coffin.html)
[![](https://i.imgur.com/TfCArU9.jpeg)](https://fineartamerica.com/featured/the-vision-of-the-valley-of-dry-bones-gustave-dore.html)
