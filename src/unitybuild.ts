import UnityCommandBuilder from './akiojin/UnityCommandBuilder';
import { UnityBuildTarget } from './akiojin/UnityBuildTarget';
import execa from 'execa';
import fs from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';

const usage = `Usage: unitybuild <unity build json file>`;

if (process.argv.length <= 2) {
  console.log(usage);
  process.exit(1);
}

const arg = process.argv[2];
if (arg === '-h' || arg === '--help') {
  console.log(usage);
  process.exit(0);
}

const jsonFile = arg;
if (!fs.existsSync(jsonFile)) {
  console.error(`File ${jsonFile} does not exist`);
  process.exit(2);
}

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
const exePath = json.exePath;
const projectPath = json.projectPath;
const target = json.target;
const logPath = json.logPath;
const method = json.method;
const zipPath = json.zipPath;
if (
  typeof exePath !== 'string' ||
  typeof projectPath !== 'string' ||
  typeof target !== 'string' ||
  typeof method !== 'string' ||
  (zipPath && typeof zipPath !== 'string')
) {
  console.error('Invalid JSON file');
  process.exit(3);
}

const outputPath = json.outputPath;
if (outputPath && typeof outputPath !== 'string') {
  console.error('Invalid JSON file');
  process.exit(3);
}

if (!fs.existsSync(exePath) || !fs.existsSync(projectPath)) {
  console.error('Invalid path(s) in JSON file');
  process.exit(4);
}

const builder = new UnityCommandBuilder()
  .SetProjectPath(projectPath)
  .SetBuildTarget(target as UnityBuildTarget);

if (typeof logPath === 'string') {
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf-8');
  }
  builder.SetLogFile(logPath);
}

builder.SetExecuteMethod(method);
if (outputPath) {
  builder.Append(outputPath as string);
}

(async function () {
  const proc = execa(exePath, builder.Build());
  proc.stdout?.pipe(process.stdout);
  const result = await proc;

  if (result.failed) {
    process.exit(result.exitCode);
  }

  const source = path.join(projectPath, outputPath);
  if (!fs.existsSync(source)) {
    console.error(`Source does not exist: ${source}`);
    process.exit(5);
  }

  if (zipPath) {
    const zip = new AdmZip();
    const sourceStat = fs.statSync(source);
    const outputFile = path.isAbsolute(zipPath)
      ? zipPath
      : path.join(process.cwd(), zipPath);
    if (sourceStat.isFile()) {
      zip.addLocalFile(source);
    } else {
      zip.addLocalFolder(source);
    }
    zip.writeZip(outputFile);

    console.log('\n');
    console.log(`Zip file created: ${outputFile}`);
  }
})();
