const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, 'hesita.svg');
const outputPath = path.join(__dirname, 'android/app/src/main/res/drawable/hestia_icon.png');

sharp(svgPath)
  .resize(1024, 1024)
  .png()
  .toFile(outputPath)
  .then(() => console.log('Icon created successfully!'))
  .catch(err => console.error('Error:', err));
