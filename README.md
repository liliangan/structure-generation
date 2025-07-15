# Project Structure Generator (项目结构生成器)

*[中文文档](#中文版本)*

A VS Code extension that scans project files and generates a structured directory tree in a file. Supports automatic updates when files change!

## ✨ Features

- **Two Generation Modes**: Project-wide structure or directory-specific structure
- **Smart File Comments**: Preserves and displays comments marked with `#` after file names
- **Auto-Update**: Optional automatic regeneration when files/folders are created, deleted, or renamed
- **Flexible Configuration**: Customizable ignore patterns, scan depth, and output file names
- **Multi-language Support**: English and Chinese interfaces
- **Intelligent Filtering**: Default ignores common directories like `.git`, `.idea`, `.vscode`, `dist`, `node_modules`

## 🚀 Usage

### Two Generation Commands

#### 1. Generate Project Structure
- **What it does**: Scans the entire project from root directory
- **Where it saves**: Always saves to project root directory
- **When to use**: For complete project documentation
- **Access**: 
  - Command Palette: "Generate Project Structure"
  - Right-click on files: "Generate Project Structure"
  - Right-click on folders: "Generate Project Structure"

#### 2. Generate Directory Structure  
- **What it does**: Scans only the selected directory
- **Where it saves**: Saves to the selected directory
- **When to use**: For documenting specific modules or subdirectories
- **Access**:
  - Right-click on folders: "Generate Directory Structure"

### How to Access Commands

#### Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Generate Project Structure" and select the command

**Note**: Command Palette only provides "Generate Project Structure" option.

#### Right-Click Context Menu
- **On Files**: Shows only "Generate Project Structure"
- **On Folders**: Shows both "Generate Project Structure" and "Generate Directory Structure"

**Key Difference**: 
- **Command Palette**: Only generates project structure
- **Right-click Folders**: Can choose between project structure or directory structure

## ⚙️ Configuration Options

Access settings by searching for "projectStructure" in VS Code settings or use the "Configure Project Structure Generator" command.

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `projectStructure.outputFileName` | string | "README" | Output file name for project structure |
| `projectStructure.directoryOutputFileName` | string | "README" | Output file name for directory structure |
| `projectStructure.ignoredPatterns` | array | `[".git", ".idea", ".vscode", "dist", "node_modules"]` | Files/directories to ignore |
| `projectStructure.maxDepth` | number | 10 | Maximum directory depth to scan |
| `projectStructure.autoUpdate` | boolean | false | Auto-update when files change |

### 🔄 Auto-Update Feature

When enabled, the extension automatically regenerates the project structure when you:
- Create new files or folders
- Delete files or folders  
- Rename files or folders

**To enable auto-update:**
1. Open VS Code settings
2. Search for `projectStructure.autoUpdate`
3. Check the box to enable

**Note**: Auto-update only affects the project structure (saved to root), not directory-specific structures.

### 🔧 Resetting Settings

If you have previously customized settings and want to use the new defaults:

1. Open VS Code settings
2. Search for the setting you want to reset
3. Click the gear icon next to the setting
4. Select "Reset Setting"

## 📁 File Comments

The extension supports comments after file names using the `#` symbol:

```
src/
├── components/
│   ├── Button.vue # Reusable button component
│   └── Modal.vue # Modal dialog component
├── utils/
│   └── helpers.js # Utility functions
└── main.js # Application entry point
```

To add comments, simply include them in existing structure files after the `#` symbol.

## 📋 Example Output

```
my-project # 
├── src # 
│   ├── components # 
│   │   ├── Header.vue # Navigation header component
│   │   ├── Footer.vue # Page footer component
│   │   └── Button.vue # Reusable button component
│   ├── router # 
│   │   └── index.js # Vue router configuration
│   ├── store # 
│   │   └── index.js # Vuex store setup
│   ├── utils # 
│   │   └── api.js # API helper functions
│   ├── App.vue # Main application component
│   └── main.js # Application entry point
├── public # 
│   ├── index.html # HTML template
│   └── favicon.ico # Site icon
├── package.json # Project dependencies
└── README.md # Project documentation
```

---

# 中文版本

VS Code 扩展，用于扫描项目文件并生成结构化的目录树文件。支持文件变化时自动更新！

## ✨ 功能特色

- **双生成模式**：项目整体结构或目录特定结构
- **智能文件注释**：保留并显示文件名后用 `#` 标记的注释
- **自动更新**：可选的文件/文件夹创建、删除或重命名时自动重新生成
- **灵活配置**：可自定义忽略模式、扫描深度和输出文件名
- **多语言支持**：中英文界面
- **智能过滤**：默认忽略常见目录如 `.git`、`.idea`、`.vscode`、`dist`、`node_modules`

## 🚀 使用方法

### 两个生成命令

#### 1. 生成项目结构
- **功能**：从根目录扫描整个项目
- **保存位置**：始终保存到项目根目录
- **使用场景**：用于完整的项目文档
- **访问方式**：
  - 命令面板："生成项目结构"
  - 文件右键："生成项目结构"
  - 文件夹右键："生成项目结构"

#### 2. 生成目录结构
- **功能**：仅扫描选中的目录
- **保存位置**：保存到选中的目录
- **使用场景**：用于记录特定模块或子目录
- **访问方式**：
  - 文件夹右键："生成目录结构"

### 命令访问方式

#### 命令面板
1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入"生成项目结构"并选择命令

**注意**：命令面板仅提供"生成项目结构"选项。

#### 右键菜单
- **文件右键**：仅显示"生成项目结构"
- **文件夹右键**：显示"生成项目结构"和"生成目录结构"

**重要区别**：
- **命令面板**：只能生成项目结构
- **右键文件夹**：可选择生成项目结构或目录结构

## ⚙️ 配置选项

在 VS Code 设置中搜索"projectStructure"或使用"配置项目结构生成器"命令访问设置。

### 可用设置

| 设置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `projectStructure.outputFileName` | 字符串 | "README" | 项目结构输出文件名 |
| `projectStructure.directoryOutputFileName` | 字符串 | "README" | 目录结构输出文件名 |
| `projectStructure.ignoredPatterns` | 数组 | `[".git", ".idea", ".vscode", "dist", "node_modules"]` | 要忽略的文件/目录 |
| `projectStructure.maxDepth` | 数字 | 10 | 扫描的最大目录深度 |
| `projectStructure.autoUpdate` | 布尔值 | false | 文件变化时自动更新 |

### 🔄 自动更新功能

启用后，扩展将在以下情况下自动重新生成项目结构：
- 创建新文件或文件夹
- 删除文件或文件夹
- 重命名文件或文件夹

**启用自动更新：**
1. 打开 VS Code 设置
2. 搜索 `projectStructure.autoUpdate`
3. 勾选复选框启用

**注意**：自动更新仅影响项目结构（保存到根目录），不影响目录特定结构。

### 🔧 重置设置

如果您之前自定义过设置并想使用新的默认值：

1. 打开 VS Code 设置
2. 搜索要重置的设置
3. 点击设置旁边的齿轮图标
4. 选择"重置设置"

## 📁 文件注释

扩展支持使用 `#` 符号在文件名后添加注释：

```
src/
├── components/
│   ├── Button.vue # 可复用按钮组件
│   └── Modal.vue # 模态对话框组件
├── utils/
│   └── helpers.js # 工具函数
└── main.js # 应用程序入口点
```

要添加注释，只需在现有结构文件中 `#` 符号后包含它们。

## 📋 输出示例

```
my-project # 
├── src # 
│   ├── components # 
│   │   ├── Header.vue # 导航头部组件
│   │   ├── Footer.vue # 页面底部组件
│   │   └── Button.vue # 可复用按钮组件
│   ├── router # 
│   │   └── index.js # Vue 路由配置
│   ├── store # 
│   │   └── index.js # Vuex 状态管理
│   ├── utils # 
│   │   └── api.js # API 辅助函数
│   ├── App.vue # 主应用组件
│   └── main.js # 应用程序入口点
├── public # 
│   ├── index.html # HTML 模板
│   └── favicon.ico # 网站图标
├── package.json # 项目依赖
└── README.md # 项目文档
```

## 📝 Changelog

### v1.0.2
- ✅ Added auto-update feature
- ✅ Fixed comment preservation issue
- ✅ Fixed file recognition issues (e.g., `routes.js`, `router` folders)
- ✅ Updated default ignore patterns (added `.git`)
- ✅ Right-click folders can choose between generating project structure or directory structure
- ✅ Command palette dedicated to generating project structure

### v1.0.1
- ✅ Added directory structure generation feature
- ✅ Multi-language support

### v1.0.0
- 🎉 Initial release

## 📝 更新日志

### v1.0.2
- ✅ 新增自动更新功能
- ✅ 修复注释保留问题
- ✅ 修复文件识别问题（如 `routes.js`、`router` 文件夹）
- ✅ 更新默认忽略模式（新增 `.git`）
- ✅ 右键文件夹可选择生成项目结构或生成目录结构
- ✅ 命令面板专门用于生成项目结构

### v1.0.1
- ✅ 添加目录结构生成功能
- ✅ 多语言支持

### v1.0.0
- 🎉 初始版本发布
