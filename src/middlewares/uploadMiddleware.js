const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedAudioTypes = /mp3|wav|ogg|m4a|webm|mp4|mpeg|x-m4a/;
  
  const extnameStr = path.extname(file.originalname).toLowerCase();
  
  const isImageExt = allowedImageTypes.test(extnameStr);
  const isImageMime = allowedImageTypes.test(file.mimetype);
  
  const isAudioExt = allowedAudioTypes.test(extnameStr) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/webm');
  const isAudioMime = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/webm') || allowedAudioTypes.test(file.mimetype);

  if ((isImageMime && isImageExt) || (isAudioMime)) {
    return cb(null, true);
  } else {
    cb(new Error("Only image and audio files are allowed"));
  }
};

const multerUploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1,
  },
});

module.exports = multerUploader;
