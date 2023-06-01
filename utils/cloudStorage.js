const Cloud = require("@google-cloud/storage");
const { Storage } = Cloud;

const { SERVICE_KEY, PROJECT_ID, BUCKET_NAME } = process.env;
const serviceKey = JSON.parse(Buffer.from(SERVICE_KEY, "base64").toString());

module.exports = {
  // Use "/" in the end of folder name
  uploadImage: async (file, folder = "") => {
    try {
      const storage = new Storage({
        credentials: serviceKey,
        projectId: PROJECT_ID,
      });

      const bucket = storage.bucket(BUCKET_NAME);

      const { originalname, buffer } = file;

      const filePath = `${folder}${Date.now()}-${originalname.replace(
        / /g,
        "_"
      )}`;

      const blob = bucket.file(filePath);

      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      const publicUrlPromise = new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          reject(err);
        });
        blobStream.on("finish", () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        });

        blobStream.end(buffer);
      });

      const publicUrl = await publicUrlPromise;
      return publicUrl;
    } catch (err) {
      throw err;
    }
  },
};
