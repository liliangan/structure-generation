# Project Structure Generator

*[中文文档](#项目结构生成器)*

A VS Code extension that scans project files and generates a structured directory tree in your README.md file.

## Features

- Automatically scans project file structure
- Generates a formatted directory tree in README.md
- Supports configuration to ignore specific files or directories
- Allows setting maximum scan depth
- Default ignores common directories like `node_modules`, `dist`, `.vscode`, and `.idea`

## Usage

1. Open the command palette in VS Code (press `Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Generate Project Structure to README.md" and select the command
3. The extension will automatically scan your current project and add the structure to your README.md file

## Configuration Options

In VS Code settings, you can customize the following options:

- `projectStructure.ignoredPatterns`: Patterns of files or directories to ignore (array)
- `projectStructure.maxDepth`: Maximum directory depth to scan (number)

You can access these configurations by:

1. Opening the command palette in VS Code
2. Typing "Configure Project Structure Generator" and selecting the command
3. Or directly searching for "projectStructure" in settings

## Example

Example of generated project structure:

```
project-name
├── src
│   ├── components
│   │   ├── Button.js
│   │   └── Input.js
│   └── utils
│       └── helpers.js
├── public
│   ├── index.html
│   └── favicon.ico
└── package.json
```

---

# 项目结构生成器

这是一个VS Code插件，用于扫描项目文件并生成包含项目结构的README.md文件。

## 功能

- 自动扫描项目文件结构
- 生成格式化的目录树到README.md
- 支持配置忽略特定文件或目录
- 支持设置扫描的最大深度
- 默认过滤常见目录，如 `node_modules`、`dist`、`.vscode` 和 `.idea`

## 使用方法

1. 在VS Code中打开命令面板（按下 `Ctrl+Shift+P` 或 `Cmd+Shift+P`）
2. 输入 "生成项目结构到README.md" 并选择该命令
3. 插件将自动扫描当前项目并将结构添加到README.md文件中

## 配置选项

在VS Code设置中，你可以自定义以下配置：

- `projectStructure.ignoredPatterns`: 要忽略的文件或目录模式（数组）
- `projectStructure.maxDepth`: 扫描的最大目录深度（数字）

你可以通过以下方式访问配置：

1. 在VS Code中打开命令面板
2. 输入 "配置项目结构生成器" 并选择该命令
3. 或者直接在设置中搜索 "projectStructure"

## 示例

生成的项目结构示例：

```
project-name
├── src
│   ├── components
│   │   ├── Button.js
│   │   └── Input.js
│   └── utils
│       └── helpers.js
├── public
│   ├── index.html
│   └── favicon.ico
└── package.json
```
