# unity-build

A script to build Unity projects from the terminal.

## Prerequisites

Node 16

## Usage

```bash
npm ci
npm run pkg
```

Create a JSON configuration file from the `config.template.json` template. In the `outputPath` field, you can use `{date}` and `{time}` variables which will be replaced with the current date and time.

In `outputPath`, `logPath` and `zipPath`, you can also use the variables `{cwd}` and `{proj}` which will be substituted with the current working directory and project directory, respectively.

```bash
./bin/unitybuild <your config file>
```

For Android builds, the following environment variables should be set in prior to calling `unitybuild`. The keystore and alias will be temporarily set to the ProjectSettings file, while passwords are read by the build method.

Batch:

```batch
SET UB_KEYSTORE="path to keystore file"
SET UB_KEYALIAS="key alias name"
SET UB_KEYSTORE_PASS="password for keystore"
SET UB_KEYALIAS_PASS="password for alias"
```

Bash:

```bash
export UB_KEYSTORE="path to keystore file"
export UB_KEYALIAS="key alias name"
export UB_KEYSTORE_PASS="password for keystore"
export UB_KEYALIAS_PASS="password for alias"
```

## Example

JSON configuration:

```json
{
  "exePath": "D:\\app\\Unities\\2019.4.26f1\\Editor\\Unity.exe",
  "projectPath": "D:\\proj\\MyFunGame",
  "target": "Android",
  "method": "Editor.Build.CLIBuild.BuildAndroid",
  "outputPath": "{proj}\\Build\\Android\\build-{date}.apk",
  "logPath": "{cwd}\\build.log",
  "zipPath": "{cwd}\\artifacts\\android-build.zip"
}
```

C# build method:

```csharp
namespace Editor.Build
{
    public static class CLIBuild
    {
        public static void BuildWebGL()
        {
            var buildPlayerOptions = new BuildPlayerOptions
            {
                scenes = new string[] { "Assets/Scenes/WebGLEntrance.unity" },
                targetGroup = BuildTargetGroup.WebGL,
                target = BuildTarget.WebGL,
                locationPathName = getOutputPath(),
                options = BuildOptions.None,
            };

            BuildPipeline.BuildPlayer(buildPlayerOptions);
        }

        public static void BuildAndroid()
        {
            PlayerSettings.keystorePass = getKeystorePass();
            PlayerSettings.keyaliasPass = getKeyAliasPass();

            var buildPlayerOptions = new BuildPlayerOptions
            {
                scenes = new string[] { "Assets/Scenes/AndroidEntrance.unity" },
                targetGroup = BuildTargetGroup.Android,
                target = BuildTarget.Android,
                locationPathName = getOutputPath(),
                options = BuildOptions.None,
            };

            BuildPipeline.BuildPlayer(buildPlayerOptions);
        }

        private static string getOutputPath()
        {
            var args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length; ++i)
            {
                if (args[i] == "-executeMethod" && i + 2 < args.Length)
                {
                    return args[i + 2];
                }
            }
            return "Build/DefaultOutput";
        }

        private static string getKeystorePass()
        {
            var varName = getVarName("UB_KEYSTORE_PASS");
            return Environment.ExpandEnvironmentVariables(varName);
        }

        private static string getKeyAliasPass()
        {
            var varName = getVarName("UB_KEYALIAS_PASS");
            return Environment.ExpandEnvironmentVariables(varName);
        }

        private static string getVarName(string varName)
        {
            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Win32NT:
                    return "%" + varName + "%";
                default:
                    return "$" + varName;
            }
        }
    }
}
```
