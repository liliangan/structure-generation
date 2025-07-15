# Project Structure Generator

*[中文文档](#项目结构生成器)*

A VS Code extension that scans project files and generates a structured directory tree in a file.

## Features

- Automatically scans project file structure
- Generates a formatted directory tree in a file
- Supports configuration to ignore specific files or directories
- Allows setting maximum scan depth
- Default ignores common directories like `node_modules`, `dist`, `.vscode`, and `.idea`

## Usage

### Command Palette
1. Open the command palette in VS Code (press `Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Generate Project Structure" and select the command
3. The extension will automatically scan your current project and add the structure to the project root's README file

### Right-click Context Menu
You can also right-click on any folder in the Explorer panel and choose from:
- **Generate Project Structure**: Scans the entire project and saves to the project root
- **Generate Directory Structure**: Scans only the selected directory and saves to that directory

## Configuration Options

In VS Code settings, you can customize the following options:

- `projectStructure.ignoredPatterns`: Patterns of files or directories to ignore (array)
- `projectStructure.maxDepth`: Maximum directory depth to scan (number), default is 10
- `projectStructure.outputFileName`: Output file name for project structure (without extension, .md will be added automatically), default is "README"
- `projectStructure.directoryOutputFileName`: Output file name for directory structure (without extension, .md will be added automatically), default is "README"

You can access these configurations by:

1. Opening the command palette in VS Code
2. Typing "Configure Project Structure Generator" and selecting the command
3. Or directly searching for "projectStructure" in settings

## Example

Example of generated project structure:

```
project-name # 
├── src # 
│   ├── components # 
│   │   ├── Button.js # 
│   │   └── Input.js # 
│   └── utils # 
│       └── helpers.js # 
├── public # 
│   ├── index.html # 
│   └── favicon.ico # 
└── package.json # 
```

---

# 项目结构生成器

这是一个VS Code插件，用于扫描项目文件并生成包含项目结构的文件。

## 功能

- 自动扫描项目文件结构
- 生成格式化的目录树到文件
- 支持配置忽略特定文件或目录
- 支持设置扫描的最大深度
- 默认过滤常见目录，如 `node_modules`、`dist`、`.vscode` 和 `.idea`

## 使用方法

### 命令面板
1. 在VS Code中打开命令面板（按下 `Ctrl+Shift+P` 或 `Cmd+Shift+P`）
2. 输入 "生成项目结构" 并选择该命令
3. 插件将自动扫描当前项目并将结构添加到项目根目录的README文件中

### 右键菜单
您也可以在资源管理器面板中右键点击任何文件夹，并选择：
- **生成项目结构**：扫描整个项目并保存到项目根目录
- **生成目录结构**：仅扫描选定的目录并保存到该目录

## 配置选项

在VS Code设置中，你可以自定义以下配置：

- `projectStructure.ignoredPatterns`: 要忽略的文件或目录模式（数组）
- `projectStructure.maxDepth`: 扫描的最大目录深度（数字），默认为10
- `projectStructure.outputFileName`: 生成项目结构的文件名称（不含扩展名，将自动添加.md），默认为"README"
- `projectStructure.directoryOutputFileName`: 生成目录结构的文件名称（不含扩展名，将自动添加.md），默认为"README"

你可以通过以下方式访问配置：

1. 在VS Code中打开命令面板
2. 输入 "配置项目结构生成器" 并选择该命令
3. 或者直接在设置中搜索 "projectStructure"

## 示例

生成的项目结构示例：

```
project-name # 
├── src # 
│   ├── components # 
│   │   ├── Button.js # 
│   │   └── Input.js # 
│   └── utils # 
│       └── helpers.js # 
├── public # 
│   ├── index.html # 
│   └── favicon.ico # 
└── package.json # 
```
