const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if(file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const srcDir = path.join(__dirname, '../src');
const allFiles = getAllFiles(srcDir);
const unusedFiles = [];

allFiles.forEach(fileToCheck => {
  const baseName = path.basename(fileToCheck);
  // ignore server.js, index.js etc if any
  let isUsed = false;
  allFiles.forEach(fileContent => {
    if (fileToCheck === fileContent) return;
    const content = fs.readFileSync(fileContent, 'utf8');
    if (content.includes(baseName) || content.includes(baseName.replace('.js', ''))) {
      isUsed = true;
    }
  });

  // check if used in server.js
  const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  if (serverContent.includes(baseName) || serverContent.includes(baseName.replace('.js', ''))) {
    isUsed = true;
  }

  if (!isUsed) {
    unusedFiles.push(fileToCheck);
  }
});

console.log("Potentially unused files:");
unusedFiles.forEach(f => console.log(f));
