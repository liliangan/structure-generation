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
        // 确定要扫描的目录路径
        let targetPath;
        // 如果是从右键菜单调用并且有资源
        if (resource && resource.fsPath) {
            const stats = fs.statSync(resource.fsPath);
            // 如果右键点击的是文件，则使用其所在目录
            targetPath = stats.isDirectory() ? resource.fsPath : path.dirname(resource.fsPath);
        }
        else {
            // 如果是从命令面板调用，则使用当前工作区
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('请先打开一个项目文件夹');
                return;
            }
            targetPath = workspaceFolders[0].uri.fsPath;
        }
        try {
            const structure = await generateProjectStructure(targetPath);
            await writeToReadme(targetPath, structure);
            vscode.window.showInformationMessage(`项目结构已成功生成到 ${path.join(targetPath, 'README.md')}`);
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
// 生成项目结构
async function generateProjectStructure(rootPath) {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const ignoredPatterns = config.get('ignoredPatterns') || [];
    const maxDepth = config.get('maxDepth') || 5;
    let structureContent = '# 项目结构\n\n```\n';
    structureContent += await scanDirectory(rootPath, '', ignoredPatterns, 0, maxDepth);
    structureContent += '```\n';
    return structureContent;
}
// 递归扫描目录
async function scanDirectory(dirPath, prefix, ignoredPatterns, currentDepth, maxDepth) {
    if (currentDepth > maxDepth) {
        return '';
    }
    let result = '';
    const dirName = path.basename(dirPath);
    // 添加当前目录名称（根目录特殊处理）
    if (prefix === '') {
        result += `${dirName}\n`;
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
        // 处理子文件和目录
        for (let i = 0; i < sortedFiles.length; i++) {
            const file = sortedFiles[i];
            const filePath = path.join(dirPath, file);
            // 检查是否应该忽略此文件或目录
            if (shouldIgnore(file, filePath, ignoredPatterns)) {
                continue;
            }
            const isLast = i === sortedFiles.length - 1;
            const stats = fs.statSync(filePath);
            const isDirectory = stats.isDirectory();
            // 确定当前项的前缀
            const currentPrefix = isLast ? '└── ' : '├── ';
            // 确定子项的前缀
            const childPrefix = isLast ? '    ' : '│   ';
            // 添加当前文件或目录
            result += `${prefix}${currentPrefix}${file}${isDirectory ? '' : ''}\n`;
            // 如果是目录，递归处理
            if (isDirectory) {
                result += await scanDirectory(filePath, prefix + childPrefix, ignoredPatterns, currentDepth + 1, maxDepth);
            }
        }
    }
    catch (error) {
        console.error(`扫描目录失败: ${dirPath}`, error);
    }
    return result;
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
// 写入到README.md文件
async function writeToReadme(targetPath, content) {
    const readmePath = path.join(targetPath, 'README.md');
    let existingContent = '';
    // 检查README.md是否已存在
    try {
        if (fs.existsSync(readmePath)) {
            existingContent = fs.readFileSync(readmePath, 'utf8');
        }
    }
    catch (error) {
        console.log('README.md不存在，将创建新文件');
    }
    // 如果已存在项目结构部分，则替换它
    const structureRegex = /# 项目结构\s*\n\s*```[\s\S]*?```\s*\n/;
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
    fs.writeFileSync(readmePath, existingContent);
    // 在VS Code中打开生成的README.md文件
    vscode.workspace.openTextDocument(readmePath).then(doc => {
        vscode.window.showTextDocument(doc);
    });
}
// 插件停用时调用
function deactivate() {
    console.log('项目结构生成器插件已停用');
}
//# sourceMappingURL=extension.js.map