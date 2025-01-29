const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uplPaths = "../../uploads/";
    const minetype = file.mimetype.split("/")[0];
    const uploadDir = path.join(__dirname, uplPaths.concat(minetype));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // cb(null, path.join(__dirname, uplPaths));

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
