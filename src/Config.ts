import fs from 'fs';
import { isValidTarget, UnityBuildTarget } from './akiojin/UnityBuildTarget';

export default class Config {
  private _exePath: string;
  private _projectPath: string;
  private _target: UnityBuildTarget;
  private _method: string;
  private _outputPath: string;
  private _logPath: string;
  private _zipPath: string;

  get exePath() {
    return this._exePath;
  }

  get projectPath() {
    return this._projectPath;
  }

  get target() {
    return this._target;
  }

  get method() {
    return this._method;
  }

  get outputPath() {
    return this._outputPath;
  }

  get logPath() {
    return this._logPath;
  }

  get hasLogPath() {
    return this._logPath != '';
  }

  get zipPath() {
    return this._zipPath;
  }

  get hasZipPath() {
    return this._zipPath != '';
  }

  constructor(jsonFile: string) {
    const json = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    const isValidJson =
      typeof json.exePath === 'string' &&
      typeof json.projectPath === 'string' &&
      typeof json.target === 'string' &&
      typeof json.method === 'string' &&
      typeof json.outputPath === 'string' &&
      (typeof json.logPath === 'undefined' ||
        typeof json.logPath === 'string') &&
      (typeof json.zipPath === 'undefined' || typeof json.zipPath === 'string');
    if (!isValidJson) {
      throw new Error('invalid config json');
    }
    this._exePath = json.exePath;
    this._projectPath = json.projectPath;
    this._target = json.target as UnityBuildTarget;
    this._method = json.method;
    this._outputPath = json.outputPath;
    if (json.logPath) {
      this._logPath = json.logPath;
    } else {
      this._logPath = '';
    }
    if (json.zipPath) {
      this._zipPath = json.zipPath;
    } else {
      this._zipPath = '';
    }

    this.validate();
    this.checkOutputPath();
  }

  private validate() {
    try {
      fs.accessSync(this.exePath, fs.constants.X_OK);
    } catch {
      throw new Error('invalid exe path');
    }

    try {
      fs.accessSync(this.projectPath, fs.constants.R_OK);
    } catch {
      throw new Error('invalid project path');
    }

    if (!isValidTarget(this.target)) {
      throw new Error('invalid build target');
    }

    const methodRegEx = /^([A-Za-z_]+\w*)(\.[A-Za-z_]+\w*)*$/;
    if (!methodRegEx.test(this.method)) {
      throw new Error('invalid method');
    }
  }

  private checkOutputPath() {
    if (this.outputPath == '') {
      throw new Error('invalid output path');
    }

    const now = new Date();
    const dateString =
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeString =
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
    this._outputPath = this._outputPath
      .replaceAll('{date}', dateString)
      .replaceAll('{time}', timeString);
  }
}
