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
        // 如果是从右键菜单调用并且有资源，使用该资源作为扫描路径
        if (resource && resource.fsPath) {
            const stats = fs.statSync(resource.fsPath);
            // 如果右键点击的是文件，则使用其所在目录
            scanPath = stats.isDirectory() ? resource.fsPath : path.dirname(resource.fsPath);
        }
        else {
            // 如果是从命令面板调用，则使用当前工作区作为扫描路径
            scanPath = rootPath;
        }
        try {
            // 从配置中获取输出文件名
            const config = vscode.workspace.getConfiguration('projectStructure');
            const outputFileName = config.get('outputFileName') || 'README';
            const structure = await generateProjectStructure(scanPath, rootPath);
            await writeToReadme(rootPath, structure);
            vscode.window.showInformationMessage(`项目结构已成功生成到 ${path.join(rootPath, `${outputFileName}.md`)}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`生成项目结构失败: ${error}`);
        }
    });
    // 注册配置命令
    let configureCommand = vscode.commands.registerCommand('project-structure.configure', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'projectStructure');
    });
    context.subscriptions.push(generateCommand, configureCommand);
}
// 解析现有的项目结构
function parseExistingStructure(content) {
    const structureMap = new Map();
    // 提取项目结构部分 - 支持多种标题格式
    const structureRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
    const match = content.match(structureRegex);
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
        console.log(`行: "${line.substring(0, 50)}..." -> 缩进级别: ${level}`);
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
            items.push({ name, comment, level, lineIndex: i });
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
// 生成项目结构
async function generateProjectStructure(rootPath, workspaceRoot) {
    var _a;
    const config = vscode.workspace.getConfiguration('projectStructure');
    const ignoredPatterns = config.get('ignoredPatterns') || [];
    const maxDepth = config.get('maxDepth') || 5;
    const outputFileName = config.get('outputFileName') || 'README';
    // 读取现有的结构
    const outputFilePath = path.join(workspaceRoot, `${outputFileName}.md`);
    let existingStructure = new Map();
    try {
        if (fs.existsSync(outputFilePath)) {
            const existingContent = fs.readFileSync(outputFilePath, 'utf8');
            console.log(`读取到的原始内容（前500字符）:`, existingContent.substring(0, 500));
            existingStructure = parseExistingStructure(existingContent);
            console.log(`解析后的根级结构:`, Array.from(existingStructure.keys()));
            if (existingStructure.size > 0) {
                const firstKey = Array.from(existingStructure.keys())[0];
                const firstItem = existingStructure.get(firstKey);
                console.log(`第一个根项目 ${firstKey}:`, {
                    comment: firstItem === null || firstItem === void 0 ? void 0 : firstItem.comment,
                    isDirectory: firstItem === null || firstItem === void 0 ? void 0 : firstItem.isDirectory,
                    childrenCount: ((_a = firstItem === null || firstItem === void 0 ? void 0 : firstItem.children) === null || _a === void 0 ? void 0 : _a.size) || 0,
                    childrenKeys: (firstItem === null || firstItem === void 0 ? void 0 : firstItem.children) ? Array.from(firstItem.children.keys()).slice(0, 5) : []
                });
            }
        }
    }
    catch (error) {
        console.log(`无法读取现有结构: ${error}`);
    }
    let structureContent = '- 项目结构\n\n```\n';
    structureContent += await scanDirectory(rootPath, '', ignoredPatterns, 0, maxDepth, existingStructure, undefined);
    structureContent += '```\n';
    return structureContent;
}
// 递归扫描目录
async function scanDirectory(dirPath, prefix, ignoredPatterns, currentDepth, maxDepth, existingStructure, currentStructureLevel) {
    if (currentDepth > maxDepth) {
        return '';
    }
    let result = '';
    const dirName = path.basename(dirPath);
    // 添加当前目录名称（根目录特殊处理）
    if (prefix === '') {
        console.log(`处理根目录: ${dirName}`);
        console.log(`existingStructure有${existingStructure.size}个根项目:`, Array.from(existingStructure.keys()));
        const existingItem = existingStructure.get(dirName);
        console.log(`查找根目录 ${dirName}:`, existingItem ? '找到' : '未找到');
        const comment = (existingItem === null || existingItem === void 0 ? void 0 : existingItem.comment) || '';
        result += `${dirName} # ${comment}\n`;
        currentStructureLevel = existingItem === null || existingItem === void 0 ? void 0 : existingItem.children;
        console.log(`根目录的子级数量:`, (currentStructureLevel === null || currentStructureLevel === void 0 ? void 0 : currentStructureLevel.size) || 0);
        if (currentStructureLevel && currentStructureLevel.size > 0) {
            console.log(`根目录的子项目:`, Array.from(currentStructureLevel.keys()).slice(0, 5));
        }
    }
    try {
        const files = fs.readdirSync(dirPath);
        const sortedFiles = files.sort((a, b) => {
            // 目录优先排序
            const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
            if (aIsDir && !bIsDir)
                return -1;
            if (!aIsDir && bIsDir)
                return 1;
            return a.localeCompare(b);
        });
        // 过滤掉应该忽略的文件
        const filteredFiles = sortedFiles.filter(file => {
            const filePath = path.join(dirPath, file);
            return !shouldIgnore(file, filePath, ignoredPatterns);
        });
        // 处理子文件和目录
        for (let i = 0; i < filteredFiles.length; i++) {
            const file = filteredFiles[i];
            const filePath = path.join(dirPath, file);
            const isLast = i === filteredFiles.length - 1;
            const stats = fs.statSync(filePath);
            const isDirectory = stats.isDirectory();
            // 确定当前项的前缀
            const currentPrefix = isLast ? '└── ' : '├── ';
            // 确定子项的前缀
            const childPrefix = isLast ? '    ' : '│   ';
            // 查找现有的注释
            let existingComment = '';
            let childStructureLevel;
            if (currentStructureLevel) {
                const existingItem = currentStructureLevel.get(file);
                existingComment = (existingItem === null || existingItem === void 0 ? void 0 : existingItem.comment) || '';
                childStructureLevel = existingItem === null || existingItem === void 0 ? void 0 : existingItem.children;
                console.log(`查找文件: ${file}, 在${currentStructureLevel.size}个项目中, 找到: ${!!existingItem}, 注释: "${existingComment}"`);
            }
            else {
                console.log(`查找文件: ${file}, currentStructureLevel为空`);
            }
            // 添加当前文件或目录
            result += `${prefix}${currentPrefix}${file} # ${existingComment}\n`;
            // 如果是目录，递归处理
            if (isDirectory) {
                result += await scanDirectory(filePath, prefix + childPrefix, ignoredPatterns, currentDepth + 1, maxDepth, existingStructure, childStructureLevel);
            }
        }
    }
    catch (error) {
        console.error(`扫描目录失败: ${dirPath}`, error);
    }
    return result;
}
// 在结构中查找项目
function findItemInStructure(structure, itemName) {
    // 先在当前级别查找
    const item = structure.get(itemName);
    if (item) {
        return item;
    }
    // 在子级别递归查找
    for (const [, childItem] of structure) {
        if (childItem.children) {
            const found = findItemInStructure(childItem.children, itemName);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}
// 检查是否应该忽略文件或目录
function shouldIgnore(fileName, filePath, ignoredPatterns) {
    return ignoredPatterns.some(pattern => {
        // 简单的通配符匹配
        if (pattern.includes('*')) {
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*');
            return new RegExp(`^${regexPattern}$`).test(fileName);
        }
        // 精确匹配文件名或路径包含模式
        return fileName === pattern || filePath.includes(pattern);
    });
}
// 写入到指定文件
async function writeToReadme(targetPath, content) {
    // 从配置中获取输出文件名
    const config = vscode.workspace.getConfiguration('projectStructure');
    const outputFileName = config.get('outputFileName') || 'README';
    const outputFilePath = path.join(targetPath, `${outputFileName}.md`);
    let existingContent = '';
    // 检查输出文件是否已存在
    try {
        if (fs.existsSync(outputFilePath)) {
            existingContent = fs.readFileSync(outputFilePath, 'utf8');
        }
    }
    catch (error) {
        console.log(`${outputFileName}.md不存在，将创建新文件`);
    }
    // 如果已存在项目结构部分，则替换它 - 支持多种标题格式
    const structureRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
    if (structureRegex.test(existingContent)) {
        existingContent = existingContent.replace(structureRegex, content);
    }
    else {
        // 否则添加到文件末尾
        existingContent = existingContent ?
            (existingContent.trim() + '\n\n' + content) :
            content;
    }
    // 写入文件
    fs.writeFileSync(outputFilePath, existingContent);
    // 在VS Code中打开生成的文件
    vscode.workspace.openTextDocument(outputFilePath).then(doc => {
        vscode.window.showTextDocument(doc);
    });
}
// 插件停用时调用
function deactivate() {
    console.log('项目结构生成器插件已停用');
}
//# sourceMappingURL=extension.js.map