# unity-build

A script to build Unity projects from the terminal.

## Prerequisites

Node 16

## Usage

```bash
npm ci
npm run pkg
```

Create a JSON configuration file from the `config.template.json` template.

```bash
./bin/unitybuild <your config file>
```

## Example

JSON configuration:

```json
{
  "exePath": "D:\\app\\Unities\\2019.4.26f1\\Editor\\Unity.exe",
  "projectPath": "D:\\proj\\MyFunGame",
  "target": "WebGL",
  "method": "Editor.Build.CLIBuild.BuildWebGL",
  "outputPath": "Build\\WebGL",
  "logPath": "build.log",
  "zipPath": "artifacts\\webgl.zip"
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
                scenes = new string[] { "Assets/Scenes/Entrance.unity" },
                targetGroup = BuildTargetGroup.WebGL,
                target = BuildTarget.WebGL,
                locationPathName = getOutputPath(),
                options = BuildOptions.None,
            };

            BuildPipeline.BuildPlayer(buildPlayerOptions);
        }

        private static string getOutputPath()
        {
            var args = System.Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length; ++i)
            {
                if (args[i] == "-executeMethod" && i + 2 < args.Length)
                {
                    return args[i + 2];
                }
            }
            return "Build/DefaultOutput";
        }
    }
}
```
