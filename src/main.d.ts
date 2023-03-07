declare namespace Types {
  interface CheckersGame {
    artworkId: string;
    dimensions: Dimensions;
    sizes: {
      [key: string]: Size;
    };
  }
  interface Dimensions {
    w: number;
    h: number;
  }
  interface Size {
    actualSize: number;
    actualDimensions: Dimensions;
    outputSize: number;
    backendSize: number;
    outputDimensions: Dimensions;
    widthMedium: number;
    heightMedium: number;
    tileCount: TileCount;
    tileCountVirtual: TileCount;
    tileMod: TileCount;
    tileModVirtual: TileCount;
    gapSize: number;
    urlParams: URLParams;
    url: string;
    tiles: Tile[];
  }
  interface TileCount {
    x: number;
    y: number;
  }
  interface Tile {
    rowColumn: TileCount;
    coordinatesImg: TileCount;
    coordinatesURL: TileCount;
    url: string;
  }
  interface URLParams {}
}
export default Types;
