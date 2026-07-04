const fs = require('fs');
const path = require('path');

function readPackageVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (typeof packageJson.version !== 'string' || packageJson.version.trim() === '') {
    throw new Error('package.json version is missing');
  }

  return packageJson.version.trim();
}

function main() {
  const version = readPackageVersion();
  const releaseDir = path.resolve(process.cwd(), 'app/build/outputs/apk/release');
  const destinationPath = path.join(releaseDir, `heattreatment-v${version}.apk`);
  const apkFiles = fs
    .readdirSync(releaseDir)
    .filter((file) => file.endsWith('.apk'))
    .map((file) => path.join(releaseDir, file));

  if (apkFiles.length === 0) {
    throw new Error(`APK not found in: ${releaseDir}`);
  }

  const sourcePath =
    apkFiles.find((file) => file.includes('release') && file !== destinationPath) ?? apkFiles[0];

  if (sourcePath === destinationPath) {
    console.log(`APK already renamed: ${destinationPath}`);
    return;
  }

  if (fs.existsSync(destinationPath)) {
    fs.unlinkSync(destinationPath);
  }

  fs.renameSync(sourcePath, destinationPath);
  console.log(`Renamed APK from ${sourcePath} to ${destinationPath}`);
}

main();
