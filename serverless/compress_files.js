const imagemin = require("imagemin");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");
const imageminPngquant = require("imagemin-pngquant");

exports.handler = async (event, context) => {
  const params = JSON.parse(event.body);
  const { base64String, name, extension } = params;
  const base64ImageData = base64String.split(";base64").pop();
  const filename = `${name}.${extension}`;

  try {
    const result = Buffer.from(base64ImageData, "base64");
    const newImgBuffer = await imagemin.buffer(result, {
      destination: "severless/compress_files",
      plugins: [
        imageminJpegRecompress({
          min: 20,
          max: 60,
        }),
        imageminPngquant({
          quality: [0.2, 0.6],
        }),
      ],
    });

    const fileSize = newImgBuffer.length;
    const base64CompString = newImgBuffer.toString("base64");
    const imageDataObj = { filename, fileSize, base64CompString };

    return {
      statusCode: 200,
      body: JSON.stringify(imageDataObj),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "File error" }),
    };
  }
};
