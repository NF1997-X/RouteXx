const path = require('path');
const fs = require('fs');

function resolvePkgMain() {
  try {
    const pkg = require(path.join(__dirname, 'package.json'));
    return pkg && pkg.main ? path.join(__dirname, pkg.main) : null;
  } catch {
    return null;
  }
}

const candidates = [
  path.join(__dirname, 'dist', 'index.js'),
  resolvePkgMain(),
  path.join(__dirname, 'src', 'index.js'),
].filter(Boolean);

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    try {
      console.log(`Loading application entry: ${candidate}`);
      require(candidate);
      return;
    } catch (err) {
      console.error(`Failed to load entry ${candidate}:`, err);
      process.exit(1);
    }
  }
}

console.error('Entry point not found. Build the project or set "main" in package.json.');
process.exit(1);