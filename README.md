# Project Structure Generator (项目结构生成器)

*[中文文档](#中文版本)*

A VS Code extension that scans project files and generates a structured directory tree in a file. Supports automatic updates when files change!

## ✨ Features

- **Two Generation Modes**: Project-wide structure or directory-specific structure
- **Smart File Comments**: Preserves and displays comments marked with `#` after file names
- **Auto-Update**: Optional automatic regeneration when files/folders are created, deleted, or renamed
- **Clipboard Export**: Copy project or directory structure without writing a file
- **Selection Conversion**: Convert selected tree text into HTML, CSV, or Mermaid mindmap files
- **Multiple Output Formats**: Generate Markdown, Mermaid mindmap (`.mmd`), CSV, or standalone HTML visualization files
- **Interactive HTML View**: HTML output includes search, expand/collapse controls, and summary stats
- **.gitignore Support**: Optionally applies `.gitignore` rules while scanning
- **Generation Stats**: Shows directory, file, and ignored item counts after generation
- **Safer Scanning**: Excludes the output file itself and sorts directories before files
- **Flexible Configuration**: Customizable ignore patterns, scan depth, and output file names
- **Multi-language Support**: English and Chinese interfaces
- **Intelligent Filtering**: Default ignores common directories like `.git`, `.idea`, `.vscode`, `dist`, `node_modules`

## 🚀 Usage

### Available Commands

#### 1. Generate Project Structure
- **What it does**: Scans the entire project from root directory
- **Where it saves**: Always saves to project root directory
- **Output behavior**: Uses `projectStructure.outputFileName` and the configured output format
- **When to use**: For complete project documentation
- **Access**: 
  - Command Palette: "Generate Project Structure"
  - Right-click on files: "Generate Project Structure"
  - Right-click on folders: "Generate Project Structure"

#### 2. Generate Directory Structure  
- **What it does**: Scans only the selected directory
- **Where it saves**: Saves to the selected directory
- **Output behavior**: Uses `projectStructure.directoryOutputFileName` and the configured output format
- **When to use**: For documenting specific modules or subdirectories
- **Access**:
  - Right-click on folders: "Generate Directory Structure"

#### 3. Copy Project Structure to Clipboard
- **What it does**: Generates the structure and copies it to the clipboard without writing a file
- **Scope**: Command Palette copies the workspace structure; right-click copies the selected folder or the parent folder of a selected file
- **Format**: Uses the currently configured `projectStructure.outputFormat`
- **When to use**: For pasting into chats, issues, prompts, or documents
- **Access**:
  - Command Palette: "Copy Project Structure to Clipboard"
  - Right-click on files/folders: "Copy Project Structure to Clipboard"

#### 4. Convert Selected Structure
- **What it does**: Converts selected tree text into HTML, CSV, or Mermaid mindmap output
- **Where it saves**: Saves next to the current file, or in the workspace root if the current document has no file path
- **Output name**: Uses `<root-name>-structure` plus the selected format extension
- **When to use**: When you already have a generated structure block in a Markdown file
- **Access**:
  - Select the structure text in the editor
  - Right-click and choose "Convert Selected Structure To..."

### How to Access Commands

#### Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Generate Project Structure" and select the command

**Note**: The Command Palette provides project-wide generation, clipboard export, and configuration commands.

#### Right-Click Context Menu
- **On Files**: Shows "Generate Project Structure" and "Copy Project Structure to Clipboard"
- **On Folders**: Shows "Generate Project Structure", "Generate Directory Structure", and "Copy Project Structure to Clipboard"

**Key Difference**: 
- **Command Palette**: Best for project-wide generation and clipboard export
- **Right-click Folders**: Can choose between project structure, directory structure, or clipboard export

## ⚙️ Configuration Options

Access settings by searching for "projectStructure" in VS Code settings or use the "Configure Project Structure Generator" command.

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `projectStructure.outputFileName` | string | "PROJECT_STRUCTURE" | Output file name for project structure, without extension |
| `projectStructure.directoryOutputFileName` | string | "PROJECT_STRUCTURE" | Output file name for directory structure, without extension |
| `projectStructure.outputFormat` | string | "markdown" | Output format: `markdown`, `mindmap`, `csv`, or `html` |
| `projectStructure.ignoredPatterns` | array | `[".git", ".idea", ".vscode", "dist", "node_modules"]` | Files/directories to ignore |
| `projectStructure.maxDepth` | number | 10 | Maximum directory depth to scan |
| `projectStructure.autoUpdate` | boolean | false | Auto-update when files change |
| `projectStructure.useGitignore` | boolean | true | Apply `.gitignore` rules while scanning |
| `projectStructure.excludeOutputFile` | boolean | true | Exclude the generated output file itself from the structure |
| `projectStructure.showStats` | boolean | true | Show directory/file/ignored counts after generation |

### Output Formats

Output file extensions are added automatically based on the selected format: `.md`, `.mmd`, `.csv`, or `.html`.

- `markdown`: Updates or creates a `.md` file, replaces the existing structure section when found, and preserves comments in the existing structure block.
- `mindmap`: Creates a Mermaid mindmap `.mmd` file for visualizing the project structure.
- `csv`: Creates a `.csv` file with path, name, type, level, parent, and comment columns.
- `html`: Creates a standalone `.html` tree view with search, expand/collapse controls, and summary stats.

### Scanning Behavior

- Existing comments after `#` are parsed from the current Markdown structure and kept during regeneration.
- Directory entries are listed before files, then sorted by name.
- Ignore patterns support exact file or directory names and simple wildcards such as `*.log`.
- When `projectStructure.useGitignore` is enabled, `.gitignore` rules are applied in addition to `projectStructure.ignoredPatterns`.
- When `projectStructure.excludeOutputFile` is enabled, the generated `.md`, `.mmd`, `.csv`, or `.html` file is not included in its own structure.

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
└── PROJECT_STRUCTURE.md # Project structure output
```

## 📝 Changelog

### v1.1.0
- ✅ Added clipboard export for project and directory structures without writing files
- ✅ Added configurable output formats: Markdown, Mermaid mindmap, CSV, and HTML
- ✅ Changed the default project and directory output file name to `PROJECT_STRUCTURE`
- ✅ Added "Convert Selected Structure To..." command for converting selected tree text into HTML, CSV, or Mermaid mindmap files
- ✅ Added standalone HTML output with search, expand/collapse controls, and summary stats
- ✅ Conversion output is saved next to the source document as `<root-name>-structure.html`, `.csv`, or `.mmd`
- ✅ Output file extensions are now determined automatically from the configured format
- ✅ Added `.gitignore` integration, output-file exclusion, and generation statistics
- ✅ Improved ignore matching with exact directory-name matching and simple wildcard support
- ✅ Improved regeneration by replacing existing Markdown structure sections and keeping file comments
- ✅ Added localized labels for clipboard, conversion, CSV, and HTML output

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
- Initial release

---

# 中文版本

VS Code 扩展，用于扫描项目文件并生成结构化的目录树文件。支持文件变化时自动更新！

## ✨ 功能特色

- **双生成模式**：项目整体结构或目录特定结构
- **智能文件注释**：保留并显示文件名后用 `#` 标记的注释
- **自动更新**：可选的文件/文件夹创建、删除或重命名时自动重新生成
- **剪贴板导出**：无需写入文件，直接复制项目或目录结构
- **选中结构转换**：将编辑器中选中的树形结构转换为 HTML、CSV 或 Mermaid 思维导图文件
- **多输出格式**：支持生成 Markdown、Mermaid 思维导图（`.mmd`）、CSV 或独立 HTML 可视化文件
- **交互式 HTML 视图**：HTML 输出包含搜索、展开/折叠和统计信息
- **.gitignore 支持**：扫描时可自动应用 `.gitignore` 规则
- **生成统计**：生成后显示目录数、文件数和忽略项数量
- **更安全的扫描**：自动排除输出文件本身，并优先排列目录再排列文件
- **灵活配置**：可自定义忽略模式、扫描深度和输出文件名
- **多语言支持**：中英文界面
- **智能过滤**：默认忽略常见目录如 `.git`、`.idea`、`.vscode`、`dist`、`node_modules`

## 🚀 使用方法

### 可用命令

#### 1. 生成项目结构
- **功能**：从根目录扫描整个项目
- **保存位置**：始终保存到项目根目录
- **输出行为**：使用 `projectStructure.outputFileName` 和当前配置的输出格式
- **使用场景**：用于完整的项目文档
- **访问方式**：
  - 命令面板："生成项目结构"
  - 文件右键："生成项目结构"
  - 文件夹右键："生成项目结构"

#### 2. 生成目录结构
- **功能**：仅扫描选中的目录
- **保存位置**：保存到选中的目录
- **输出行为**：使用 `projectStructure.directoryOutputFileName` 和当前配置的输出格式
- **使用场景**：用于记录特定模块或子目录
- **访问方式**：
  - 文件夹右键："生成目录结构"

#### 3. 复制项目结构到剪贴板
- **功能**：生成结构并复制到剪贴板，不写入文件
- **扫描范围**：命令面板复制工作区结构；右键时复制选中文件夹或选中文件所在目录
- **格式**：使用当前配置的 `projectStructure.outputFormat`
- **使用场景**：粘贴到聊天、Issue、提示词或文档
- **访问方式**：
  - 命令面板："复制项目结构到剪贴板"
  - 文件/文件夹右键："复制项目结构到剪贴板"

#### 4. 转换选中的结构
- **功能**：将编辑器中选中的树形结构转换为 HTML、CSV 或 Mermaid 思维导图
- **保存位置**：保存到当前文件所在目录；如果当前文档没有文件路径，则保存到工作区根目录
- **输出名称**：使用 `<根节点名称>-structure` 加所选格式扩展名
- **使用场景**：已有 Markdown 文件里的结构块，需要临时转换成其他格式
- **访问方式**：
  - 在编辑器中选中结构文本
  - 右键选择"将选中结构转换为..."

### 命令访问方式

#### 命令面板
1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入"生成项目结构"并选择命令

**注意**：命令面板提供项目整体生成、剪贴板导出和配置命令。

#### 右键菜单
- **文件右键**：显示"生成项目结构"和"复制项目结构到剪贴板"
- **文件夹右键**：显示"生成项目结构"、"生成目录结构"和"复制项目结构到剪贴板"

**重要区别**：
- **命令面板**：适合生成项目整体结构和复制到剪贴板
- **右键文件夹**：可选择生成项目结构、目录结构或复制到剪贴板

## ⚙️ 配置选项

在 VS Code 设置中搜索"projectStructure"或使用"配置项目结构生成器"命令访问设置。

### 可用设置

| 设置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `projectStructure.outputFileName` | 字符串 | "PROJECT_STRUCTURE" | 项目结构输出文件名，不含扩展名 |
| `projectStructure.directoryOutputFileName` | 字符串 | "PROJECT_STRUCTURE" | 目录结构输出文件名，不含扩展名 |
| `projectStructure.outputFormat` | 字符串 | "markdown" | 输出格式：`markdown`、`mindmap`、`csv` 或 `html` |
| `projectStructure.ignoredPatterns` | 数组 | `[".git", ".idea", ".vscode", "dist", "node_modules"]` | 要忽略的文件/目录 |
| `projectStructure.maxDepth` | 数字 | 10 | 扫描的最大目录深度 |
| `projectStructure.autoUpdate` | 布尔值 | false | 文件变化时自动更新 |
| `projectStructure.useGitignore` | 布尔值 | true | 扫描时应用 `.gitignore` 规则 |
| `projectStructure.excludeOutputFile` | 布尔值 | true | 从生成的结构中排除输出文件本身 |
| `projectStructure.showStats` | 布尔值 | true | 生成后显示目录/文件/忽略项数量 |

### 输出格式

输出文件会根据所选格式自动添加扩展名：`.md`、`.mmd`、`.csv` 或 `.html`。

- `markdown`：更新或创建 `.md` 文件；如果找到已有结构段会直接替换，并保留已有结构块里的注释。
- `mindmap`：创建 Mermaid 思维导图 `.mmd` 文件，用于可视化项目结构。
- `csv`：创建 `.csv` 文件，包含路径、名称、类型、层级、父目录和注释列。
- `html`：创建独立 `.html` 树形视图，包含搜索、展开/折叠和统计信息。

### 扫描行为

- 会从当前 Markdown 结构中解析 `#` 后的已有注释，并在重新生成时保留。
- 目录会排在文件之前，同类型项目按名称排序。
- 忽略模式支持精确文件名、目录名和 `*.log` 这类简单通配符。
- 启用 `projectStructure.useGitignore` 后，会在 `projectStructure.ignoredPatterns` 之外继续应用 `.gitignore` 规则。
- 启用 `projectStructure.excludeOutputFile` 后，生成的 `.md`、`.mmd`、`.csv` 或 `.html` 文件不会出现在自己的结构中。

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
└── PROJECT_STRUCTURE.md # 项目结构输出
```

## 📝 更新日志

### v1.1.0
- ✅ 新增剪贴板导出，可复制项目结构或目录结构且不写入文件
- ✅ 新增可配置输出格式：Markdown、Mermaid 思维导图、CSV 和 HTML
- ✅ 将项目结构和目录结构的默认输出文件名改为 `PROJECT_STRUCTURE`
- ✅ 新增"将选中结构转换为..."命令，可将选中的树形结构转换为 HTML、CSV 或 Mermaid 思维导图文件
- ✅ 新增独立 HTML 输出，支持搜索、展开/折叠和统计信息
- ✅ 转换结果会保存到源文档所在目录，文件名为 `<根节点名称>-structure.html`、`.csv` 或 `.mmd`
- ✅ 输出文件扩展名会根据配置的格式自动确定
- ✅ 新增 `.gitignore` 集成、输出文件自排除和生成统计
- ✅ 优化忽略匹配，支持精确目录名匹配和简单通配符
- ✅ 优化重新生成逻辑，可替换已有 Markdown 结构段并保留文件注释
- ✅ 补充剪贴板、转换命令、CSV 和 HTML 输出相关的本地化文案

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
- 初始版本发布
