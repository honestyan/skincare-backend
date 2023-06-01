require("dotenv-vault-core").config();
const axios = require("axios");
const utilCloudStorage = require("../utils/cloudStorage");
const utilPreprocess = require("../utils/preprocess");
const { SKIN_DISEASES_MODEL_URL, SKIN_TYPES_MODEL_URL } = process.env;

module.exports = {
  predictSkinDiseases: async (req, res, next) => {
    const myFile = req.file;
    const publicUrl = await utilCloudStorage
      .uploadImage(myFile)
      .catch((err) => {
        const { status, data } = err.response;
        res.status(status).json(data);
        return null;
      });

    if (!publicUrl) return;

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

    const classLabels = ["Acne", "Black Spot", "Puff Eye", "Wrinkle"];

    const predictions = resPredict.data.predictions[0];

    const predictedClassIndex = predictions.indexOf(Math.max(...predictions));
    const predictedClassLabel = classLabels[predictedClassIndex];

    const accuracy = predictions[predictedClassIndex];

    const { status } = resPredict;

    return res.status(status).json({
      code: status,
      success: true,
      data: {
        label: predictedClassLabel,
        accuracy: accuracy,
        predictions,
      },
    });
  },
};
