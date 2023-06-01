const axios = require("axios");
const utilCloudStorage = require("../utils/cloudStorage");
const utilPreprocess = require("../utils/preprocess");
const { SKIN_DISEASES_MODEL_URL, SKIN_TYPES_MODEL_URL } = process.env;

module.exports = {
  predictSkinDiseases: async (req, res, next) => {
    const file = req.file;
    // Use "/" in the end of folder name
    const folder = "skin_diseases/";
    const publicUrl = await utilCloudStorage
      .uploadImage(file, folder)
      .catch((err) => {
        next(err);
      });

    const resUpload = await axios({
      url: publicUrl,
      responseType: "arraybuffer",
    });

    const image = Buffer.from(resUpload.data, "binary");

    const imageList = await utilPreprocess.image(image);

    const reqPredict = {
      instances: imageList,
    };

    const resPredict = await axios
      .post(SKIN_DISEASES_MODEL_URL, reqPredict)
      .catch((err) => {
        const { status, data } = err.response;
        res.status(status).json({
          code: status,
          success: false,
          data,
        });
        return null;
      });
    if (!resPredict) return;

    const labels = ["Acne", "Black Spot", "Puff Eye", "Wrinkle"];

    const predictions = resPredict.data.predictions[0];

    const predictedLabelIndex = predictions.indexOf(Math.max(...predictions));
    const predictedLabel = labels[predictedLabelIndex];

    const accuracy = predictions[predictedLabelIndex];

    const { status } = resPredict;

    return res.status(status).json({
      code: status,
      success: true,
      data: {
        label: predictedLabel,
        accuracy: accuracy,
        predictions,
      },
    });
  },
  predictSkinTypes: async (req, res, next) => {
    const file = req.file;
    // Use "/" in the end of folder name
    const folder = "skin_types/";
    const publicUrl = await utilCloudStorage
      .uploadImage(file, folder)
      .catch((err) => {
        next(err);
      });

    const resUpload = await axios({
      url: publicUrl,
      responseType: "arraybuffer",
    });

    const image = Buffer.from(resUpload.data, "binary");

    const imageList = await utilPreprocess.image(image);

    const reqPredict = {
      instances: imageList,
    };

    const resPredict = await axios
      .post(SKIN_TYPES_MODEL_URL, reqPredict)
      .catch((err) => {
        const { status, data } = err.response;
        res.status(status).json({
          code: status,
          success: false,
          data,
        });
        return null;
      });
    if (!resPredict) return;

    const labels = ["Dry", "Normal", "Oily", "Sensitive"];

    const predictions = resPredict.data.predictions[0];

    const predictedLabelIndex = predictions.indexOf(Math.max(...predictions));
    const predictedLabel = labels[predictedLabelIndex];

    const accuracy = predictions[predictedLabelIndex];

    const { status } = resPredict;

    return res.status(status).json({
      code: status,
      success: true,
      data: {
        label: predictedLabel,
        accuracy: accuracy,
        predictions,
      },
    });
  },
};
