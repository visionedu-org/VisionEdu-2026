import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildAttachmentContentDisposition } from "./content-disposition";
import type {
  GetSignedUrlOptions,
  PutObjectInput,
  PutObjectResult,
  StorageAdapter,
} from "./types";

function getS3Config() {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim() ?? "us-east-1";

  if (!bucket) {
    throw new Error("S3_BUCKET must be set when STORAGE_PROVIDER=s3");
  }

  return { bucket, region };
}

function createS3Client(): S3Client {
  const { region } = getS3Config();
  const endpoint = process.env.S3_ENDPOINT?.trim();

  return new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export class S3StorageAdapter implements StorageAdapter {
  private readonly client = createS3Client();

  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    const { bucket } = getS3Config();
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      })
    );
    return { key: input.key, etag: result.ETag };
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds: number = 3600,
    options?: GetSignedUrlOptions
  ): Promise<string> {
    const { bucket } = getS3Config();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(options?.downloadFileName
        ? {
            ResponseContentDisposition: buildAttachmentContentDisposition(
              options.downloadFileName
            ),
          }
        : {}),
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    const { bucket } = getS3Config();
    await this.client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key })
    );
  }
}
