declare module 'heic-decode' {
  interface DecodeOptions {
    buffer: ArrayBuffer | Uint8Array;
  }
  interface DecodeResult {
    width: number;
    height: number;
    data: ArrayBuffer;
  }
  export default function decode(options: DecodeOptions): Promise<DecodeResult>;
}
