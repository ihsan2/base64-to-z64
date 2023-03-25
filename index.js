const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const zplImageConvert = require("@replytechnologies/zpl-image-convert")
const fs = require("fs");
const mime = require("mime");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const convert = async (req, res, next) => {
//   to declare some path to store your converted image
  var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");
  let decodedImg = response;
  let imageBuffer = decodedImg.data;
  let type = decodedImg.type;
  let extension = mime.getExtension(type);
  let dateNow = Date.now();
  let fileName = `image-${dateNow}.` + extension;
  try {
    fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
    const zpl = await zplImageConvert.encode(`./images/${fileName}`, {
      method: "Z64",
    });
    return res.send({ status: "success", data: zpl });
  } catch (e) {
    next(e);
  }
};

app.post("/convert", convert);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
