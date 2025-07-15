import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 定义结构项接口
interface StructureItem {
    name: string;
    comment: string;
    isDirectory: boolean;
    children?: Map<string, StructureItem>;
}

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    console.log('项目结构生成器插件已激活');

    // 注册生成项目结构命令
    let generateCommand = vscode.commands.registerCommand('project-structure.generate', async (resource: vscode.Uri | undefined) => {
        // 确定要扫描的目录路径和生成README的目录路径
        let scanPath: string;
        let rootPath: string;
        
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
            
            const structure = await generateProjectStructure(scanPath, rootPath);
            await writeToReadme(rootPath, structure);
            vscode.window.showInformationMessage(`项目结构已成功生成到 ${path.join(rootPath, `${outputFileName}.md`)}`);
        } catch (error) {
            vscode.window.showErrorMessage(`生成项目结构失败: ${error}`);
        }
    });

    // 注册生成目录结构命令
    let generateDirectoryCommand = vscode.commands.registerCommand('project-structure.generateDirectory', async (resource: vscode.Uri | undefined) => {
        // 确定要扫描的目录路径和生成README的目录路径
        let scanPath: string;
        let outputPath: string;
        
        // 如果是从右键菜单调用并且有资源
        if (resource && resource.fsPath) {
            const stats = fs.statSync(resource.fsPath);
            // 如果右键点击的是文件，则使用其所在目录
            scanPath = stats.isDirectory() ? resource.fsPath : path.dirname(resource.fsPath);
            outputPath = scanPath; // 生成到当前目录
        } else {
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
            const outputFileName = (config.get('directoryOutputFileName') as string) || 'README';
            
            const structure = await generateDirectoryStructure(scanPath, outputPath, outputFileName);
            await writeToFile(outputPath, structure, outputFileName);
            vscode.window.showInformationMessage(`目录结构已成功生成到 ${path.join(outputPath, `${outputFileName}.md`)}`);
        } catch (error) {
            vscode.window.showErrorMessage(`生成目录结构失败: ${error}`);
        }
    });

    // 注册配置命令
    let configureCommand = vscode.commands.registerCommand('project-structure.configure', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'projectStructure');
    });

    context.subscriptions.push(generateCommand, generateDirectoryCommand, configureCommand);
}

// 解析现有的项目结构
function parseExistingStructure(content: string): Map<string, StructureItem> {
    const structureMap = new Map<string, StructureItem>();
    
    // 提取项目结构部分 - 支持多种标题格式
    const structureRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构|## Project Structure|## Directory Structure)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
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
    const items: { name: string, comment: string, level: number, lineIndex: number }[] = [];
    
    // 第一遍：提取所有项目信息
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // 计算缩进级别 - 修正逻辑
        let level = 0;
        
        // 根据树形结构的格式来判断级别
        if (line.match(/^[├└]──/)) {
            // 直接以├──或└──开始的是第1级（根目录的直接子项目）
            level = 1;
        } else if (line.match(/^[^│\s]/)) {
            // 不以│或空格开始的是根级（级别0）
            level = 0;
        } else {
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
        } else if (cleanLine.includes(' #')) {
            // 紧凑格式：文件名 #注释 或 文件名 #
            const parts = cleanLine.split(' #');
            name = parts[0].trim();
            comment = parts.slice(1).join(' #').trim();
        } else {
            // 没有分隔符
            name = cleanLine.trim();
            comment = '';
        }
        

        
        if (name) {
            items.push({ name, comment, level, lineIndex: i });
        }
    }
    
    // 第二遍：构建结构，根据下一级是否有子项判断目录
    const stack: { item: StructureItem, level: number }[] = [];
    
    for (let i = 0; i < items.length; i++) {
        const { name, comment, level } = items[i];
        
        // 判断是否为目录：检查下一个项目是否比当前级别更深
        const isDirectory = level === 0 || // 根目录总是目录
                           (i + 1 < items.length && items[i + 1].level > level);
        
        const item: StructureItem = {
            name,
            comment,
            isDirectory,
            children: isDirectory ? new Map() : undefined
        };
        
        if (level === 0) {
            structureMap.set(name, item);
            stack.length = 0;
            stack.push({ item, level });
        } else {
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
function getLocalizedTitle(isProject: boolean = true): string {
    const locale = vscode.env.language;
    if (locale.startsWith('zh')) {
        // 中文环境
        return isProject ? '## 项目结构' : '## 目录结构';
    } else {
        // 英文环境
        return isProject ? '## Project Structure' : '## Directory Structure';
    }
}

// 生成项目结构
async function generateProjectStructure(rootPath: string, workspaceRoot: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const ignoredPatterns: string[] = config.get('ignoredPatterns') || [];
    const maxDepth: number = config.get('maxDepth') || 10;
    const outputFileName = config.get('outputFileName') || 'README';
    
    // 读取现有的结构
    const outputFilePath = path.join(workspaceRoot, `${outputFileName}.md`);
    let existingStructure = new Map<string, StructureItem>();
    
    try {
        if (fs.existsSync(outputFilePath)) {
            const existingContent = fs.readFileSync(outputFilePath, 'utf8');
            existingStructure = parseExistingStructure(existingContent);
        }
    } catch (error) {
        console.log(`无法读取现有结构: ${error}`);
    }

    const title = getLocalizedTitle(true);
    let structureContent = `${title}\n\n\`\`\`\n`;
    structureContent += await scanDirectory(rootPath, '', ignoredPatterns, 0, maxDepth, existingStructure, undefined);
    structureContent += '```\n';

    return structureContent;
}

// 生成目录结构
async function generateDirectoryStructure(rootPath: string, outputPath: string, outputFileName: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('projectStructure');
    const ignoredPatterns: string[] = config.get('ignoredPatterns') || [];
    const maxDepth: number = config.get('maxDepth') || 10;
    
    // 读取现有的结构
    const outputFilePath = path.join(outputPath, `${outputFileName}.md`);
    let existingStructure = new Map<string, StructureItem>();
    
    try {
        if (fs.existsSync(outputFilePath)) {
            const existingContent = fs.readFileSync(outputFilePath, 'utf8');
            existingStructure = parseExistingStructure(existingContent);
        }
    } catch (error) {
        console.log(`无法读取现有结构: ${error}`);
    }

    const title = getLocalizedTitle(false);
    let structureContent = `${title}\n\n\`\`\`\n`;
    structureContent += await scanDirectory(rootPath, '', ignoredPatterns, 0, maxDepth, existingStructure, undefined);
    structureContent += '```\n';

    return structureContent;
}

// 递归扫描目录
async function scanDirectory(
    dirPath: string, 
    prefix: string, 
    ignoredPatterns: string[], 
    currentDepth: number,
    maxDepth: number,
    existingStructure: Map<string, StructureItem>,
    currentStructureLevel?: Map<string, StructureItem>
): Promise<string> {
    if (currentDepth > maxDepth) {
        return '';
    }

    let result = '';
    const dirName = path.basename(dirPath);
    
    // 添加当前目录名称（根目录特殊处理）
    if (prefix === '') {
        const existingItem = existingStructure.get(dirName);
        const comment = existingItem?.comment || '';
        result += `${dirName} # ${comment}\n`;
        currentStructureLevel = existingItem?.children;
    }

    try {
        const files = fs.readdirSync(dirPath);
        const sortedFiles = files.sort((a, b) => {
            // 目录优先排序
            const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
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
            let childStructureLevel: Map<string, StructureItem> | undefined;
            
            if (currentStructureLevel) {
                const existingItem = currentStructureLevel.get(file);
                existingComment = existingItem?.comment || '';
                childStructureLevel = existingItem?.children;
            }
            
            // 添加当前文件或目录
            result += `${prefix}${currentPrefix}${file} # ${existingComment}\n`;
            
            // 如果是目录，递归处理
            if (isDirectory) {
                result += await scanDirectory(
                    filePath, 
                    prefix + childPrefix, 
                    ignoredPatterns, 
                    currentDepth + 1,
                    maxDepth,
                    existingStructure,
                    childStructureLevel
                );
            }
        }
    } catch (error) {
        console.error(`扫描目录失败: ${dirPath}`, error);
    }

    return result;
}

// 在结构中查找项目
function findItemInStructure(structure: Map<string, StructureItem>, itemName: string): StructureItem | undefined {
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
function shouldIgnore(fileName: string, filePath: string, ignoredPatterns: string[]): boolean {
    return ignoredPatterns.some(pattern => {
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

// 写入到指定文件
async function writeToReadme(targetPath: string, content: string): Promise<void> {
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
    } catch (error) {
        console.log(`${outputFileName}.md不存在，将创建新文件`);
    }

    // 如果已存在项目结构部分，则替换它 - 支持多种标题格式
    const structureRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构|## Project Structure|## Directory Structure)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
    if (structureRegex.test(existingContent)) {
        existingContent = existingContent.replace(structureRegex, content);
    } else {
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

// 写入到指定目录的文件
async function writeToFile(targetPath: string, content: string, fileName: string): Promise<void> {
    const outputFilePath = path.join(targetPath, `${fileName}.md`);
    let existingContent = '';

    // 检查输出文件是否已存在
    try {
        if (fs.existsSync(outputFilePath)) {
            existingContent = fs.readFileSync(outputFilePath, 'utf8');
        }
    } catch (error) {
        console.log(`${fileName}.md不存在，将创建新文件`);
    }

    // 如果已存在结构部分，则替换它 - 支持多种标题格式
    const structureRegex = /(- 项目结构|### 目录结构|## 项目结构|## 目录结构|## Project Structure|## Directory Structure)\s*\n\s*```[\s\S]*?```\s*(\n|$)/;
    if (structureRegex.test(existingContent)) {
        existingContent = existingContent.replace(structureRegex, content);
    } else {
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
export function deactivate() {
    console.log('项目结构生成器插件已停用');
}
