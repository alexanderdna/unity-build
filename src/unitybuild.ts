import fs from 'fs';
import path from 'path';
import execa from 'execa';
import AdmZip from 'adm-zip';
import UnityCommandBuilder from './akiojin/UnityCommandBuilder';
import ProjectSettings from './ProjectSettings';
import Config from './Config';

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

let config: Config;

try {
  config = new Config(jsonFile);
} catch (err) {
  console.error(err);
  process.exit(3);
}

const builder = new UnityCommandBuilder()
  .SetProjectPath(config.projectPath)
  .SetBuildTarget(config.target);

if (config.hasLogPath) {
  builder.SetLogFile(config.logPath);
}

builder.SetExecuteMethod(config.method);
builder.Append(config.outputPath);

const projectSettings = new ProjectSettings(config.projectPath);
projectSettings.read();
if (config.target === 'Android') {
  projectSettings.setKeystoreDetails();
}

(async function () {
  let result: execa.ExecaReturnValue<string> | undefined = undefined;
  let execErr;
  try {
    const proc = execa(config.exePath, builder.Build());
    proc.stdout?.pipe(process.stdout);
    result = await proc;
  } catch (err) {
    console.error(err);
    execErr = err;
  } finally {
    projectSettings.revert();
    if (execErr) {
      process.exit(999);
    }
  }

  if (!result) return;

  if (result.failed) {
    process.exit(result.exitCode);
  }

  if (result.stdout.length > 0) {
    console.log('\n');
  }

  const artifactPath = path.isAbsolute(config.outputPath)
    ? config.outputPath
    : path.join(config.projectPath, config.outputPath);
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact does not exist: ${artifactPath}`);
    process.exit(5);
  }

  if (config.hasZipPath) {
    const zip = new AdmZip();
    const sourceStat = fs.statSync(artifactPath);
    const outputFile = path.isAbsolute(config.zipPath)
      ? config.zipPath
      : path.join(process.cwd(), config.zipPath);
    if (sourceStat.isFile()) {
      zip.addLocalFile(artifactPath);
    } else {
      zip.addLocalFolder(artifactPath);
    }
    zip.writeZip(outputFile);
    console.log(`Zip file created: ${outputFile}`);
  }
})();
