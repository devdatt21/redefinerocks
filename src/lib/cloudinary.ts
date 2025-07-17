import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadAudioToCloudinary = async (buffer: Buffer, filename: string) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video', // Use 'video' for audio files
        folder: 'qa-platform/audio', // Organize files in folders
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension from filename
        format: 'mp3', // Convert to mp3 for better web compatibility
        quality: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};
