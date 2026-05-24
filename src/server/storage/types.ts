export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface PutObjectResult {
  key: string;
  etag?: string;
}

export interface GetSignedUrlOptions {
  /** Nome sugerido no download (`Content-Disposition: attachment`). */
  downloadFileName?: string;
}

export interface StorageAdapter {
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  getSignedUrl(
    key: string,
    expiresInSeconds?: number,
    options?: GetSignedUrlOptions
  ): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export type StorageProvider = "local" | "s3";
