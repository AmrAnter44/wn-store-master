const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputFolder = ".";
const outputFolder = ".\New folder";

// الأبعاد المرجعية (768x950)
const targetWidth = 768;
const targetHeight = 950;

// اعمل فولدر لو مش موجود
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

fs.readdirSync(inputFolder).forEach(file => {
  const inputPath = path.join(inputFolder, file);
  const outputPath = path.join(outputFolder, file);

  // تأكد إنه صورة
  if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
    sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: "cover",   // ممكن تخليها "contain" لو عايز ما يتقصش
      })
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Done: ${file}`);
      })
      .catch(err => {
        console.error(`❌ Error with ${file}:`, err);
      });
  }
});
