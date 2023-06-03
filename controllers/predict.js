const axios = require("axios");
const utilCloudStorage = require("../utils/cloudStorage");
const utilPreprocess = require("../utils/preprocess");
const { SKIN_DISEASES_MODEL_URL, SKIN_TYPES_MODEL_URL } = process.env;

module.exports = {
  predictSkin: async (req, res, next) => {
    const file = req.file;
    const publicUrl = await utilCloudStorage.uploadImage(file).catch((err) => {
      next(err);
    });

    const resUpload = await axios({
      url: publicUrl,
      responseType: "arraybuffer",
    });

    const image = Buffer.from(resUpload.data, "binary");

    const imageList = await utilPreprocess.image(image);

    const bodyPredict = {
      instances: imageList,
    };

    const reqPredictSkinDiseases = await axios.post(
      SKIN_DISEASES_MODEL_URL,
      bodyPredict
    );

    const reqPredictSkinTypes = await axios.post(
      SKIN_TYPES_MODEL_URL,
      bodyPredict
    );

    const response = await Promise.all([
      reqPredictSkinDiseases,
      reqPredictSkinTypes,
    ]).catch((err) => {
      const { status, data } = err.response;
      res.status(status).json({
        code: status,
        success: false,
        data,
      });
      return null;
    });

    if (!response) return;

    const labelsSkinDiseases = ["Acne", "Black Spot", "Puff Eye", "Wrinkle"];
    const labelsSkinTypes = ["Dry", "Normal", "Oily", "Sensitive"];

    const skinDiseasesPredictions = response[0].data.predictions[0];
    const skinTypesPredictions = response[1].data.predictions[0];

    const idxSkinDiseases = skinDiseasesPredictions.indexOf(
      Math.max(...skinDiseasesPredictions)
    );
    const idxSkinTypes = skinTypesPredictions.indexOf(
      Math.max(...skinTypesPredictions)
    );

    const predictedSkinDiseasesLabel = labelsSkinDiseases[idxSkinDiseases];
    const predictedSkinTypesLabel = labelsSkinTypes[idxSkinTypes];

    const skinDiseasesAccuracy = skinDiseasesPredictions[idxSkinDiseases];
    const skinTypesAccuracy = skinTypesPredictions[idxSkinTypes];

    return res.status(200).json({
      code: 200,
      success: true,
      data: {
        publicUrl,
        skinDiseases: {
          label: predictedSkinDiseasesLabel,
          accuracy: skinDiseasesAccuracy,
          predictions: skinDiseasesPredictions,
        },
        skinTypes: {
          label: predictedSkinTypesLabel,
          accuracy: skinTypesAccuracy,
          predictions: skinTypesPredictions,
        },
      },
    });
  },
};
