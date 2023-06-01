const sharp = require("sharp");

module.exports = {
  image: async (imageBuffer) => {
    const image = sharp(imageBuffer);

    const imageResize = await image.resize({ width: 224, height: 224 });

    const imageData = await imageResize.raw().toBuffer();

    const pixels = [];

    for (let y = 0; y < 224; y++) {
      const _pixels = [];
      for (let x = 0; x < 224; x++) {
        const offset = (y * 224 + x) * 3;
        const r = +parseFloat(imageData[offset] / 255);
        const g = +parseFloat(imageData[offset + 1] / 255);
        const b = +parseFloat(imageData[offset + 2] / 255);
        _pixels.push([r, g, b]);
      }
      pixels.push(_pixels);
    }
    return [pixels];
  },
};
