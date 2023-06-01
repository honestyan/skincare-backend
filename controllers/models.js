require("dotenv-vault-core").config();
const axios = require("axios");
const { PREDICT_SKIN_DISEASES_URL } = process.env;

module.exports = {
  modelsSkinDiseases: async (req, res, next) => {
    try {
      const _res = await axios.post(PREDICT_SKIN_DISEASES_URL, req.body);
      const { status, data } = _res;
      return res.status(status).json(data);
    } catch (err) {
      const { status, data } = err.response;
      return res.status(status).json(data);
    }
  },
};
