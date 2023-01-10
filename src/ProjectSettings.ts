import path from 'path';
import fs from 'fs';

export default class ProjectSettings {
  private filePath: string;
  private oldContent: string = '';

  constructor(projectPath: string) {
    this.filePath = path.join(
      projectPath,
      'ProjectSettings',
      'ProjectSettings.asset'
    );
  }

  read() {
    this.oldContent = fs.readFileSync(this.filePath, 'utf-8');
  }

  setKeystoreDetails() {
    if (this.oldContent == '') throw new Error('Content not available');

    let keystore = process.env.UB_KEYSTORE;
    let keyalias = process.env.UB_KEYALIAS;
    if (typeof keystore === 'string' && typeof keyalias === 'string') {
      const newContent = this.oldContent
        .replace(
          /AndroidKeystoreName: [^\r\n]*/,
          `AndroidKeystoreName: '${keystore}'`
        )
        .replace(
          /AndroidKeyaliasName: [^\r\n]*/,
          `AndroidKeyaliasName: ${keyalias}`
        )
        .replace('androidUseCustomKeystore: 0', 'androidUseCustomKeystore: 1');
      fs.writeFileSync(this.filePath, newContent, 'utf-8');
    }
  }

  revert() {
    if (this.oldContent != '') {
      fs.writeFileSync(this.filePath, this.oldContent, 'utf-8');
    }
  }
}
