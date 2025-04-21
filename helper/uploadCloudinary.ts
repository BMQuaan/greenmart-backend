import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};
