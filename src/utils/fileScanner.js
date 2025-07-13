import fs from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'cves');

export function scanCveJsonFiles() {
  const years = fs.readdirSync(baseDir).filter(file =>
    fs.statSync(path.join(baseDir, file)).isDirectory()
  );

  let json_files = [];

  for (const year of years) {
    const yearPath = path.join(baseDir, year);
    const subFolders = fs.readdirSync(yearPath).filter(file =>
      fs.statSync(path.join(yearPath, file)).isDirectory()
    );

    for (const sub of subFolders) {
      const subPath = path.join(yearPath, sub);
      const jsonFiles = fs.readdirSync(subPath).filter(file =>
        file.endsWith('.json')
      );

      for (const json of jsonFiles) {
        json_files.push(path.join(subPath, json));
      }
    }
  }

  return json_files;
}
