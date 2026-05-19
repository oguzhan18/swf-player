import { createSwfAsset, type SwfAsset } from "@/domain/entities/SwfAsset";
import type { SwfFileReaderPort } from "@/domain/ports/SwfFileReaderPort";

export class BrowserSwfFileReader implements SwfFileReaderPort {
  read(file: File): Promise<SwfAsset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (!(result instanceof ArrayBuffer)) {
          reject(new Error("Unexpected read result"));
          return;
        }
        resolve(createSwfAsset(file, result));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
      reader.readAsArrayBuffer(file);
    });
  }
}
