export interface SwfAsset {
  readonly name: string;
  readonly size: number;
  readonly data: ArrayBuffer;
  readonly mimeType: string;
  readonly sourceUrl?: string;
}

export function createSwfAsset(file: File, data: ArrayBuffer): SwfAsset {
  return {
    name: file.name,
    size: file.size,
    data,
    mimeType: file.type || "application/x-shockwave-flash",
  };
}

export function createSwfAssetFromBuffer(
  name: string,
  data: ArrayBuffer,
  sourceUrl?: string,
): SwfAsset {
  return {
    name,
    size: data.byteLength,
    data,
    mimeType: "application/x-shockwave-flash",
    sourceUrl,
  };
}
