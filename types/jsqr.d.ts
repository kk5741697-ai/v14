declare module "jsqr" {
  export interface Point { x: number; y: number; }

  export interface QRCode {
    binaryData: Uint8Array;
    data: string;
    chunks: any[];
    location: {
      topLeftCorner: Point;
      topRightCorner: Point;
      bottomLeftCorner: Point;
      bottomRightCorner: Point;
    };
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): QRCode | null;
}
