import type { SwfAsset } from "@/domain/entities/SwfAsset";

export interface SwfFileReaderPort {
  read(file: File): Promise<SwfAsset>;
}
