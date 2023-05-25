const utilCloudStorage = require("../utils/cloudStorage");

module.exports = {
  storage: async (req, res, next) => {
    try {
      const myFile = req.file;
      const publicUrl = await utilCloudStorage.uploadImage(myFile);
      res.status(200).json({
        code: 200,
        message: "Upload was successful",
        data: {
          publicUrl: publicUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
