"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let autoUpdateTimer;
let isGenerating = false;
const autoUpdateDelayMs = 500;
const structureSectionRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构|## Project Structure|## Directory Structure)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
// 激活插件
function activate(context) {
    console.log('项目结构生成器插件已激活');
    // 注册生成项目结构命令
    let generateCommand = vscode.commands.registerCommand('project-structure.generate', async (resource) => {
        // 确定要扫描的目录路径和生成README的目录路径
        let scanPath;
        let rootPath;
        // 获取工作区根目录（用于生成README.md）
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('请先打开一个项目文件夹');
            return;
        }
        rootPath = workspaceFolders[0].uri.fsPath;
        // 生成项目结构始终扫描整个项目根目录
        scanPath = rootPath;
        try {
            // 从配置中获取输出文件名
            const config = vscode.workspace.getConfiguration('projectStructure');
            const outputFileName = config.get('outputFileName') || 'README';
            const result = await generateStructure({
                scanPath,
                outputPath: rootPath,
                outputFileName,
                isProject: true
            });
            await writeStructureFile(rootPath, result.content, outputFileName, result.extension, true);
            vscode.window.showInformationMessage(getGeneratedMessage(`项目结构已成功生成到 ${path.join(rootPath, `${outputFileName}.${result.extension}`)}`, result.stats));
        }
        catch (error) {
            vscode.window.showErrorMessage(`生成项目结构失败: ${error}`);
        }
    });
    // 注册生成目录结构命令
    let generateDirectoryCommand = vscode.commands.registerCommand('project-structure.generateDirectory', async (resource) => {
        // 确定要扫描的目录路径和生成README的目录路径
        let scanPath;
        let outputPath;
        // 如果是从右键菜单调用并且有资源
        if (resource && resource.fsPath) {
            const stats = fs.statSync(resource.fsPath);
            // 如果右键点击的是文件，则使用其所在目录
            scanPath = stats.isDirectory() ? resource.fsPath : path.dirname(resource.fsPath);
            outputPath = scanPath; // 生成到当前目录
        }
        else {
            // 如果是从命令面板调用，则使用当前工作区
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('请先打开一个项目文件夹');
                return;
            }
            scanPath = workspaceFolders[0].uri.fsPath;
            outputPath = scanPath;
        }
        try {
            // 从配置中获取目录输出文件名
            const config = vscode.workspace.getConfiguration('projectStructure');
            const outputFileName = config.get('directoryOutputFileName') || 'README';
            const result = await generateStructure({
                scanPath,
                outputPath,
                outputFileName,
                isProject: false
            });
            await writeStructureFile(outputPath, result.content, outputFileName, result.extension, true);
            vscode.window.showInformationMessage(getGeneratedMessage(`目录结构已成功生成到 ${path.join(outputPath, `${outputFileName}.${result.extension}`)}`, result.stats));
        }
        catch (error) {
            vscode.window.showErrorMessage(`生成目录结构失败: ${error}`);
        }
    });
    // 注册复制结构到剪贴板命令
    let copyCommand = vscode.commands.registerCommand('project-structure.copy', async (resource) => {
        let scanPath;
        let outputPath;
        let outputFileName;
        let isProject;
        const config = vscode.workspace.getConfiguration('projectStructure');
        if (resource && resource.fsPath) {
            const stats = await fs.promises.stat(resource.fsPath);
            scanPath = stats.isDirectory() ? resource.fsPath : path.dirname(resource.fsPath);
            outputPath = scanPath;
            outputFileName = config.get('directoryOutputFileName') || 'README';
            isProject = false;
        }
        else {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('请先打开一个项目文件夹');
                return;
            }
            scanPath = workspaceFolders[0].uri.fsPath;
            outputPath = scanPath;
            outputFileName = config.get('outputFileName') || 'README';
            isProject = true;
        }
        try {
            const result = await generateStructure({
                scanPath,
                outputPath,
                outputFileName,
                isProject
            });
            await vscode.env.clipboard.writeText(result.content);
            vscode.window.showInformationMessage(getGeneratedMessage('项目结构已复制到剪贴板', result.stats));
        }
        catch (error) {
            vscode.window.showErrorMessage(`复制项目结构失败: ${error}`);
        }
    });
    // 注册配置命令
    let configureCommand = vscode.commands.registerCommand('project-structure.configure', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'projectStructure');
    });
    context.subscriptions.push(generateCommand, generateDirectoryCommand, copyCommand, configureCommand);
    // 设置文件系统监听器
    setupFileWatcher(context);
}
// 解析现有的项目结构
function parseExistingStructure(content) {
    const structureMap = new Map();
    // 提取项目结构部分 - 支持多种标题格式
    const match = content.match(structureSectionRegex);
    if (!match) {
        return structureMap;
    }
    // 提取代码块中的内容
    const codeBlockRegex = /```([\s\S]*?)```/;
    const codeMatch = match[0].match(codeBlockRegex);
    if (!codeMatch) {
        return structureMap;
    }
    const lines = codeMatch[1].split('\n');
    const items = [];
    // 第一遍：提取所有项目信息
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim())
            continue;
        // 计算缩进级别 - 修正逻辑
        let level = 0;
        // 根据树形结构的格式来判断级别
        if (line.match(/^[├└]──/)) {
            // 直接以├──或└──开始的是第1级（根目录的直接子项目）
            level = 1;
        }
        else if (line.match(/^[^│\s]/)) {
            // 不以│或空格开始的是根级（级别0）
            level = 0;
        }
        else {
            // 包含│符号的行，统计│的数量+1
            const barCount = (line.match(/│/g) || []).length;
            level = barCount + 1;
        }
        // 提取文件名和注释 - 更精确的解析逻辑
        let cleanLine = line.trim();
        // 移除树形结构的符号，保留文件名和注释
        cleanLine = cleanLine.replace(/^[│\s]*/, ''); // 移除前导的│和空格
        cleanLine = cleanLine.replace(/^[├└]──\s*/, ''); // 移除├──或└──及其后的空格
        // 检查是否有 # 分隔符 - 支持多种格式
        let name = '';
        let comment = '';
        if (cleanLine.includes(' # ')) {
            // 标准格式：文件名 # 注释
            const parts = cleanLine.split(' # ');
            name = parts[0].trim();
            comment = parts.slice(1).join(' # ').trim();
        }
        else if (cleanLine.includes(' #')) {
            // 紧凑格式：文件名 #注释 或 文件名 #
            const parts = cleanLine.split(' #');
            name = parts[0].trim();
            comment = parts.slice(1).join(' #').trim();
        }
        else {
            // 没有分隔符
            name = cleanLine.trim();
            comment = '';
        }
        if (name) {
            items.push({ name, comment, level });
        }
    }
    // 第二遍：构建结构，根据下一级是否有子项判断目录
    const stack = [];
    for (let i = 0; i < items.length; i++) {
        const { name, comment, level } = items[i];
        // 判断是否为目录：检查下一个项目是否比当前级别更深
        const isDirectory = level === 0 || // 根目录总是目录
            (i + 1 < items.length && items[i + 1].level > level);
        const item = {
            name,
            comment,
            isDirectory,
            children: isDirectory ? new Map() : undefined
        };
        if (level === 0) {
            structureMap.set(name, item);
            stack.length = 0;
            stack.push({ item, level });
        }
        else {
            // 找到正确的父级
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }
            if (stack.length > 0) {
                const parent = stack[stack.length - 1].item;
                if (parent.children) {
                    parent.children.set(name, item);
                }
            }
            stack.push({ item, level });
        }
    }
    return structureMap;
}
// 获取本地化标题
function getLocalizedTitle(isProject = true) {
    const locale = vscode.env.language;
    if (locale.startsWith('zh')) {
        // 中文环境
        return isProject ? '## 项目结构' : '## 目录结构';
    }
    else {
        // 英文环境
        return isProject ? '## Project Structure' : '## Directory Structure';
    }
}
// 生成结构
async function generateStructure(options) {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const ignoredPatterns = config.get('ignoredPatterns') || [];
    const maxDepth = config.get('maxDepth') || 10;
    const useGitignore = config.get('useGitignore', true);
    const excludeOutputFile = config.get('excludeOutputFile', true);
    const outputFormat = getOutputFormat();
    const extension = getOutputExtension(outputFormat);
    const outputFilePath = path.join(options.outputPath, `${options.outputFileName}.${extension}`);
    // 读取现有的结构
    let existingStructure = new Map();
    try {
        if (fs.existsSync(outputFilePath)) {
            const existingContent = fs.readFileSync(outputFilePath, 'utf8');
            existingStructure = parseExistingStructure(existingContent);
        }
    }
    catch (error) {
        console.log(`无法读取现有结构: ${error}`);
    }
    const stats = {
        directories: 0,
        files: 0,
        ignored: 0
    };
    const scanContext = {
        ignoredPatterns,
        gitignoreRules: useGitignore ? await readGitignoreRules(options.scanPath) : [],
        workspaceRoot: options.scanPath,
        outputFilePath,
        excludeOutputFile,
        stats,
        nodes: []
    };
    const title = getLocalizedTitle(options.isProject);
    const treeContent = await scanDirectory(options.scanPath, '', scanContext, 0, maxDepth, existingStructure, undefined);
    const structureContent = formatStructureContent(outputFormat, title, treeContent, scanContext.nodes);
    return {
        content: structureContent,
        extension,
        format: outputFormat,
        stats
    };
}
// 递归扫描目录
async function scanDirectory(dirPath, prefix, context, currentDepth, maxDepth, existingStructure, currentStructureLevel) {
    if (currentDepth > maxDepth) {
        return '';
    }
    let result = '';
    const dirName = path.basename(dirPath);
    // 添加当前目录名称（根目录特殊处理）
    if (prefix === '') {
        context.stats.directories++;
        const existingItem = existingStructure.get(dirName);
        const comment = (existingItem === null || existingItem === void 0 ? void 0 : existingItem.comment) || '';
        context.nodes.push({
            name: dirName,
            path: dirPath,
            relativePath: '',
            level: 0,
            comment,
            isDirectory: true,
            parentPath: ''
        });
        result += `${dirName} # ${comment}\n`;
        currentStructureLevel = existingItem === null || existingItem === void 0 ? void 0 : existingItem.children;
    }
    try {
        const sortedFiles = (await fs.promises.readdir(dirPath, { withFileTypes: true }))
            .filter(file => {
            const filePath = path.join(dirPath, file.name);
            const ignored = shouldIgnore(file.name, filePath, file.isDirectory(), context);
            if (ignored) {
                context.stats.ignored++;
            }
            return !ignored;
        })
            .sort((a, b) => {
            // 目录优先排序
            const aIsDir = a.isDirectory();
            const bIsDir = b.isDirectory();
            if (aIsDir && !bIsDir)
                return -1;
            if (!aIsDir && bIsDir)
                return 1;
            return a.name.localeCompare(b.name);
        });
        // 处理子文件和目录
        for (let i = 0; i < sortedFiles.length; i++) {
            const file = sortedFiles[i];
            const filePath = path.join(dirPath, file.name);
            const isLast = i === sortedFiles.length - 1;
            const isDirectory = file.isDirectory();
            if (isDirectory) {
                context.stats.directories++;
            }
            else {
                context.stats.files++;
            }
            // 确定当前项的前缀
            const currentPrefix = isLast ? '└── ' : '├── ';
            // 确定子项的前缀
            const childPrefix = isLast ? '    ' : '│   ';
            // 查找现有的注释
            let existingComment = '';
            let childStructureLevel;
            if (currentStructureLevel) {
                const existingItem = currentStructureLevel.get(file.name);
                existingComment = (existingItem === null || existingItem === void 0 ? void 0 : existingItem.comment) || '';
                childStructureLevel = existingItem === null || existingItem === void 0 ? void 0 : existingItem.children;
            }
            // 添加当前文件或目录
            const relativePath = path.relative(context.workspaceRoot, filePath);
            context.nodes.push({
                name: file.name,
                path: filePath,
                relativePath,
                level: currentDepth + 1,
                comment: existingComment,
                isDirectory,
                parentPath: path.dirname(relativePath) === '.' ? '' : path.dirname(relativePath)
            });
            result += `${prefix}${currentPrefix}${file.name} # ${existingComment}\n`;
            // 如果是目录，递归处理
            if (isDirectory) {
                result += await scanDirectory(filePath, prefix + childPrefix, context, currentDepth + 1, maxDepth, existingStructure, childStructureLevel);
            }
        }
    }
    catch (error) {
        console.error(`扫描目录失败: ${dirPath}`, error);
    }
    return result;
}
function formatStructureContent(format, title, treeContent, nodes) {
    if (format === 'mindmap') {
        return formatMindmap(nodes);
    }
    if (format === 'csv') {
        return formatCsv(nodes);
    }
    if (format === 'html') {
        return formatHtml(nodes);
    }
    return `${title}\n\n\`\`\`\n${treeContent}\`\`\`\n`;
}
function formatMindmap(nodes) {
    const lines = ['mindmap'];
    for (const node of nodes) {
        const indent = '  '.repeat(node.level + 1);
        const label = node.level === 0 ? `root((${escapeMindmapText(node.name)}))` : escapeMindmapText(getDisplayName(node));
        lines.push(`${indent}${label}`);
    }
    return `${lines.join('\n')}\n`;
}
function formatCsv(nodes) {
    const labels = getCsvLabels();
    const rows = [
        [labels.path, labels.name, labels.type, labels.level, labels.parent, labels.comment],
        ...nodes.map(node => [
            node.relativePath || node.name,
            node.name,
            node.isDirectory ? labels.directory : labels.file,
            String(node.level),
            node.parentPath,
            node.comment
        ])
    ];
    return `${rows.map(row => row.map(escapeCsvCell).join(',')).join('\n')}\n`;
}
function getCsvLabels() {
    if (vscode.env.language.startsWith('zh')) {
        return {
            path: '路径',
            name: '名称',
            type: '类型',
            level: '层级',
            parent: '父目录',
            comment: '注释',
            directory: '目录',
            file: '文件'
        };
    }
    return {
        path: 'Path',
        name: 'Name',
        type: 'Type',
        level: 'Level',
        parent: 'Parent',
        comment: 'Comment',
        directory: 'directory',
        file: 'file'
    };
}
function formatHtml(nodes) {
    const root = buildHtmlTree(nodes);
    const labels = getHtmlLabels();
    const totalDirectories = nodes.filter(node => node.isDirectory).length;
    const totalFiles = nodes.filter(node => !node.isDirectory).length;
    const maxDepth = nodes.reduce((depth, node) => Math.max(depth, node.level), 0);
    const treeMarkup = root ? renderHtmlNode(root) : `<p class="empty">${labels.empty}</p>`;
    const generatedAt = new Date().toLocaleString(vscode.env.language.startsWith('zh') ? 'zh-CN' : 'en');
    return `<!doctype html>
<html lang="${labels.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml((root === null || root === void 0 ? void 0 : root.name) || 'Project Structure')}</title>
  <style>
    :root {
      --bg: #f6f3eb;
      --panel: #fffdf7;
      --ink: #1f2a2e;
      --muted: #687177;
      --line: #d7d0c1;
      --accent: #176b87;
      --accent-soft: #d7edf2;
      --file: #7b5e2b;
      --shadow: 0 18px 50px rgba(47, 38, 20, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        linear-gradient(90deg, rgba(31,42,46,0.035) 1px, transparent 1px),
        linear-gradient(rgba(31,42,46,0.035) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
      color: var(--ink);
      font-family: ui-serif, Georgia, "Times New Roman", serif;
    }
    .shell {
      width: min(1180px, calc(100vw - 40px));
      margin: 32px auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 64px);
      line-height: 0.95;
      letter-spacing: 0;
      max-width: 760px;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
      text-align: right;
      white-space: nowrap;
    }
    .toolbar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      margin: 22px 0;
    }
    input {
      width: 100%;
      border: 1px solid var(--line);
      background: rgba(255, 253, 247, 0.86);
      color: var(--ink);
      padding: 13px 14px;
      border-radius: 6px;
      font: 15px ui-sans-serif, system-ui, sans-serif;
      outline: none;
    }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
    button {
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--ink);
      border-radius: 6px;
      padding: 0 14px;
      font: 600 13px ui-sans-serif, system-ui, sans-serif;
      cursor: pointer;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      box-shadow: 0 8px 24px rgba(47, 38, 20, 0.06);
    }
    .stat strong {
      display: block;
      font-size: 28px;
      line-height: 1;
    }
    .stat span {
      display: block;
      color: var(--muted);
      margin-top: 6px;
      font: 12px ui-sans-serif, system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .tree {
      background: rgba(255, 253, 247, 0.9);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 18px;
      overflow: auto;
    }
    ul {
      list-style: none;
      margin: 0;
      padding-left: 24px;
      position: relative;
    }
    ul ul::before {
      content: "";
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 10px;
      border-left: 1px solid var(--line);
    }
    li {
      position: relative;
      margin: 4px 0;
      min-width: 260px;
    }
    li::before {
      content: "";
      position: absolute;
      left: -14px;
      top: 15px;
      width: 14px;
      border-top: 1px solid var(--line);
    }
    details > summary {
      list-style: none;
      cursor: pointer;
    }
    details > summary::-webkit-details-marker { display: none; }
    .node {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: 100%;
      min-height: 28px;
      border-radius: 6px;
      padding: 5px 8px;
      font: 14px ui-sans-serif, system-ui, sans-serif;
    }
    .dir {
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 700;
    }
    .file {
      color: var(--file);
    }
    .name {
      overflow-wrap: anywhere;
    }
    .comment {
      color: var(--muted);
      font-size: 12px;
    }
    .hidden { display: none; }
    .empty {
      color: var(--muted);
      font: 15px ui-sans-serif, system-ui, sans-serif;
    }
    @media (max-width: 720px) {
      header, .toolbar { grid-template-columns: 1fr; display: grid; }
      .meta { text-align: left; }
      .stats { grid-template-columns: 1fr; }
      .shell { width: min(100vw - 24px, 1180px); margin: 18px auto; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <h1>${escapeHtml((root === null || root === void 0 ? void 0 : root.name) || 'Project Structure')}</h1>
      <div class="meta">${labels.generated} ${escapeHtml(generatedAt)}</div>
    </header>
    <section class="stats" aria-label="${labels.statsAria}">
      <div class="stat"><strong>${totalDirectories}</strong><span>${labels.directories}</span></div>
      <div class="stat"><strong>${totalFiles}</strong><span>${labels.files}</span></div>
      <div class="stat"><strong>${maxDepth}</strong><span>${labels.maxDepth}</span></div>
    </section>
    <section class="toolbar">
      <input id="search" type="search" placeholder="${labels.searchPlaceholder}" aria-label="${labels.searchAria}">
      <button id="toggle" type="button">${labels.expandAll}</button>
    </section>
    <section class="tree" id="tree">${treeMarkup}</section>
  </main>
  <script>
    const search = document.getElementById('search');
    const toggle = document.getElementById('toggle');
    const tree = document.getElementById('tree');
    const labels = ${JSON.stringify({
        expandAll: labels.expandAll,
        collapseAll: labels.collapseAll
    })};
    let expanded = false;

    toggle.addEventListener('click', () => {
      expanded = !expanded;
      tree.querySelectorAll('details').forEach(detail => detail.open = expanded);
      toggle.textContent = expanded ? labels.collapseAll : labels.expandAll;
    });

    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();
      const items = Array.from(tree.querySelectorAll('li[data-path]'));
      if (!query) {
        items.forEach(item => item.classList.remove('hidden'));
        return;
      }

      const visible = new Set();
      const matched = items.filter(item => item.dataset.search.includes(query));

      matched.forEach(item => {
        visible.add(item.dataset.path);
        const parentPath = item.dataset.parent;
        if (parentPath) {
          parentPath.split('/').reduce((current, part) => {
            const next = current ? current + '/' + part : part;
            visible.add(next);
            return next;
          }, '');
        }

        item.querySelectorAll('li[data-path]').forEach(child => visible.add(child.dataset.path));
      });

      items.forEach(item => {
        const shouldShow = visible.has(item.dataset.path);
        item.classList.toggle('hidden', !shouldShow);
        if (shouldShow) {
          item.closest('details')?.setAttribute('open', '');
        }
      });
    });
  </script>
</body>
</html>
`;
}
function buildHtmlTree(nodes) {
    const nodeMap = new Map();
    for (const node of nodes) {
        nodeMap.set(node.relativePath, Object.assign(Object.assign({}, node), { children: [] }));
    }
    let root;
    for (const node of nodeMap.values()) {
        if (node.level === 0) {
            root = node;
            continue;
        }
        const parent = nodeMap.get(node.parentPath);
        if (parent) {
            parent.children.push(node);
        }
    }
    return root;
}
function renderHtmlNode(node) {
    const searchText = escapeHtml(`${node.relativePath} ${node.name} ${node.comment}`.toLowerCase());
    const rawNodePath = getHtmlNodeKey(node);
    const rawParentPath = node.level === 0 ? '' : node.parentPath ? `${getHtmlRootName(node)}/${node.parentPath}` : getHtmlRootName(node);
    const nodePath = escapeHtml(rawNodePath);
    const parentPath = escapeHtml(rawParentPath);
    const nodeClass = node.isDirectory ? 'node dir' : 'node file';
    const icon = node.isDirectory ? '▸' : '•';
    const label = `<span class="${nodeClass}"><span>${icon}</span><span class="name">${escapeHtml(node.name)}</span>${node.comment ? `<span class="comment">${escapeHtml(node.comment)}</span>` : ''}</span>`;
    if (node.children.length === 0) {
        return `<ul><li data-path="${nodePath}" data-parent="${parentPath}" data-search="${searchText}">${label}</li></ul>`;
    }
    const children = node.children.map(child => renderHtmlNode(child).replace(/^<ul>|<\/ul>$/g, '')).join('');
    return `<ul><li data-path="${nodePath}" data-parent="${parentPath}" data-search="${searchText}"><details ${node.level <= 1 ? 'open' : ''}><summary>${label}</summary><ul>${children}</ul></details></li></ul>`;
}
function getHtmlNodeKey(node) {
    return node.relativePath ? `${getHtmlRootName(node)}/${node.relativePath}` : node.name;
}
function getHtmlRootName(node) {
    const normalizedPath = normalizePath(node.path);
    const normalizedRelativePath = normalizePath(node.relativePath);
    if (!normalizedRelativePath) {
        return node.name;
    }
    const rootPath = normalizedPath.slice(0, normalizedPath.length - normalizedRelativePath.length).replace(/\/$/, '');
    return path.basename(rootPath) || node.name;
}
function getHtmlLabels() {
    const isChinese = vscode.env.language.startsWith('zh');
    if (isChinese) {
        return {
            lang: 'zh-CN',
            generated: '生成时间',
            statsAria: '结构统计',
            directories: '目录',
            files: '文件',
            maxDepth: '最大层级',
            searchPlaceholder: '搜索路径或名称',
            searchAria: '搜索项目结构',
            expandAll: '全部展开',
            collapseAll: '全部折叠',
            empty: '没有可显示的结构。'
        };
    }
    return {
        lang: 'en',
        generated: 'Generated',
        statsAria: 'Structure statistics',
        directories: 'Directories',
        files: 'Files',
        maxDepth: 'Max Depth',
        searchPlaceholder: 'Search paths or names',
        searchAria: 'Search project structure',
        expandAll: 'Expand all',
        collapseAll: 'Collapse all',
        empty: 'No structure to display.'
    };
}
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function getDisplayName(node) {
    return node.comment ? `${node.name} # ${node.comment}` : node.name;
}
function escapeMindmapText(value) {
    return value.replace(/["'`()[\]{}]/g, '').trim() || 'unnamed';
}
function escapeCsvCell(value) {
    const escapedValue = value.replace(/"/g, '""');
    return /[",\n\r]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
}
function getOutputFormat() {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const format = config.get('outputFormat');
    if (format === 'mindmap' || format === 'csv' || format === 'html') {
        return format;
    }
    return 'markdown';
}
function getOutputExtension(format) {
    if (format === 'mindmap') {
        return 'mmd';
    }
    if (format === 'csv') {
        return 'csv';
    }
    if (format === 'html') {
        return 'html';
    }
    return 'md';
}
async function readGitignoreRules(rootPath) {
    const gitignorePath = path.join(rootPath, '.gitignore');
    try {
        const content = await fs.promises.readFile(gitignorePath, 'utf8');
        return content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
            const negated = line.startsWith('!');
            let pattern = negated ? line.slice(1) : line;
            const directoryOnly = pattern.endsWith('/');
            const anchored = pattern.startsWith('/');
            if (anchored) {
                pattern = pattern.slice(1);
            }
            if (directoryOnly) {
                pattern = pattern.slice(0, -1);
            }
            return {
                pattern,
                negated,
                directoryOnly,
                anchored
            };
        })
            .filter(rule => rule.pattern.length > 0);
    }
    catch (_a) {
        return [];
    }
}
// 检查是否应该忽略文件或目录
function shouldIgnore(fileName, filePath, isDirectory, context) {
    if (context.excludeOutputFile && context.outputFilePath && filePath === context.outputFilePath) {
        return true;
    }
    if (matchesIgnoredPatterns(fileName, filePath, context.ignoredPatterns)) {
        return true;
    }
    return matchesGitignore(filePath, isDirectory, context);
}
function matchesIgnoredPatterns(fileName, filePath, ignoredPatterns) {
    return ignoredPatterns.some(pattern => {
        // 跳过空字符串
        if (!pattern || pattern.trim() === '') {
            return false;
        }
        // 简单的通配符匹配
        if (pattern.includes('*')) {
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*');
            return new RegExp(`^${regexPattern}$`).test(fileName);
        }
        // 精确匹配文件名
        if (fileName === pattern) {
            return true;
        }
        // 检查路径中的目录名是否匹配（避免子字符串误匹配）
        const pathParts = filePath.split(path.sep);
        return pathParts.some(part => part === pattern);
    });
}
function matchesGitignore(filePath, isDirectory, context) {
    if (context.gitignoreRules.length === 0) {
        return false;
    }
    const relativePath = normalizePath(path.relative(context.workspaceRoot, filePath));
    let ignored = false;
    for (const rule of context.gitignoreRules) {
        if (rule.directoryOnly && !isDirectory) {
            continue;
        }
        if (matchesGitignoreRule(relativePath, filePath, rule)) {
            ignored = !rule.negated;
        }
    }
    return ignored;
}
function matchesGitignoreRule(relativePath, filePath, rule) {
    const pattern = normalizePath(rule.pattern);
    if (rule.anchored || pattern.includes('/')) {
        return wildcardMatch(relativePath, pattern);
    }
    const pathParts = relativePath.split('/');
    return pathParts.some(part => wildcardMatch(part, pattern)) || wildcardMatch(path.basename(filePath), pattern);
}
function wildcardMatch(value, pattern) {
    const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${escapedPattern}$`).test(value);
}
function normalizePath(value) {
    return value.split(path.sep).join('/');
}
// 写入结构到指定目录的文件
async function writeStructureFile(targetPath, content, fileName, extension, openAfterWrite) {
    const outputFilePath = path.join(targetPath, `${fileName}.${extension}`);
    let existingContent = '';
    if (extension !== 'md') {
        await fs.promises.writeFile(outputFilePath, content);
        if (openAfterWrite) {
            const doc = await vscode.workspace.openTextDocument(outputFilePath);
            await vscode.window.showTextDocument(doc);
        }
        return;
    }
    // 检查输出文件是否已存在
    try {
        if (fs.existsSync(outputFilePath)) {
            existingContent = fs.readFileSync(outputFilePath, 'utf8');
        }
    }
    catch (error) {
        console.log(`${fileName}.md不存在，将创建新文件`);
    }
    // 如果已存在结构部分，则替换它 - 支持多种标题格式
    if (structureSectionRegex.test(existingContent)) {
        existingContent = existingContent.replace(structureSectionRegex, content);
    }
    else {
        // 否则添加到文件末尾
        existingContent = existingContent ?
            (existingContent.trim() + '\n\n' + content) :
            content;
    }
    // 写入文件
    await fs.promises.writeFile(outputFilePath, existingContent);
    if (openAfterWrite) {
        // 在VS Code中打开生成的文件
        const doc = await vscode.workspace.openTextDocument(outputFilePath);
        await vscode.window.showTextDocument(doc);
    }
}
// 设置文件系统监听器
function setupFileWatcher(context) {
    // 监听文件创建
    const onCreateDisposable = vscode.workspace.onDidCreateFiles(async (event) => {
        await handleFileSystemChange('创建', event.files);
    });
    // 监听文件删除
    const onDeleteDisposable = vscode.workspace.onDidDeleteFiles(async (event) => {
        await handleFileSystemChange('删除', event.files);
    });
    // 监听文件重命名
    const onRenameDisposable = vscode.workspace.onDidRenameFiles(async (event) => {
        const files = event.files.map(file => file.newUri);
        await handleFileSystemChange('重命名', files);
    });
    context.subscriptions.push(onCreateDisposable, onDeleteDisposable, onRenameDisposable);
}
// 处理文件系统变化
async function handleFileSystemChange(changeType, files) {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const autoUpdate = config.get('autoUpdate', false);
    if (!autoUpdate || isGenerating) {
        return;
    }
    // 获取工作区根目录
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;
    const outputFileName = config.get('outputFileName') || 'README';
    const outputExtension = getOutputExtension(getOutputFormat());
    const outputFilePath = path.join(rootPath, `${outputFileName}.${outputExtension}`);
    // 检查变化的文件是否在工作区内
    const changedFiles = files.filter(file => isPathInside(rootPath, file.fsPath) && file.fsPath !== outputFilePath);
    if (changedFiles.length === 0) {
        return;
    }
    if (autoUpdateTimer) {
        clearTimeout(autoUpdateTimer);
    }
    autoUpdateTimer = setTimeout(async () => {
        isGenerating = true;
        try {
            // 自动更新项目结构
            const result = await generateStructure({
                scanPath: rootPath,
                outputPath: rootPath,
                outputFileName,
                isProject: true
            });
            await writeStructureFile(rootPath, result.content, outputFileName, result.extension, false);
            // 显示更新通知
            vscode.window.showInformationMessage(getGeneratedMessage(`项目结构已自动更新（${changeType}了 ${changedFiles.length} 个文件）`, result.stats));
        }
        catch (error) {
            console.error('自动更新项目结构失败:', error);
            vscode.window.showWarningMessage('自动更新项目结构失败，请手动更新');
        }
        finally {
            isGenerating = false;
            autoUpdateTimer = undefined;
        }
    }, autoUpdateDelayMs);
}
function isPathInside(parentPath, childPath) {
    const relativePath = path.relative(parentPath, childPath);
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}
function getGeneratedMessage(baseMessage, stats) {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const showStats = config.get('showStats', true);
    if (!showStats) {
        return baseMessage;
    }
    return `${baseMessage}（目录 ${stats.directories}，文件 ${stats.files}，忽略 ${stats.ignored}）`;
}
// 插件停用时调用
function deactivate() {
    if (autoUpdateTimer) {
        clearTimeout(autoUpdateTimer);
        autoUpdateTimer = undefined;
    }
    console.log('项目结构生成器插件已停用');
}
//# sourceMappingURL=extension.js.map