const { resolve } = require('path');
const { readdir } = require('fs').promises;
var fs = require('fs');
const path = require('path');
var crypto = require('crypto');

if (process.argv.length < 3) {
    console.log('Usage: node .\sling-resumable-cli.js src');
    console.log('src should point to source directory');
    process.exit();
}

const myArgs = process.argv.slice(2);
myArgs[0] = 'src';

let serverRoot = myArgs[1];

if (!serverRoot || serverRoot === '') {
    serverRoot = 'server.js';
}

let dirname = myArgs[0];

if (!dirname || dirname === '') {
    dirname = __dirname;
} else {
    dirname = path.join(__dirname, dirname);
}

const filePath = path.join(dirname, 'dist_frontend');
const filePathSerialized = path.join(dirname, 'dist_backend');
const filePathNodeModules = path.join(dirname, 'node_modules');
const filePathGit = path.join(dirname, '.git');

const lastForward = dirname.lastIndexOf('/');
const lastBackward = dirname.lastIndexOf('\\');
let filePathDistNodeModules = '';

if (lastForward > lastBackward) {
    const dir = dirname.substring(0, dirname.lastIndexOf('/'));
    filePathDistNodeModules = path.join(dir, 'dist');
    filePathDistNodeModules = path.join(filePathDistNodeModules, 'node_modules');
} else {
    const dir = dirname.substring(0, dirname.lastIndexOf('\\'));
    filePathDistNodeModules = path.join(dir, 'dist');
    filePathDistNodeModules = path.join(filePathDistNodeModules, 'node_modules');
}

fs.mkdirSync(filePathDistNodeModules, { recursive: true })
fs.mkdirSync(filePath, { recursive: true })
fs.mkdirSync(filePathSerialized, { recursive: true })

function copyFileSync(source, target) {

    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function removeCommentsFromLines(lines) {
    let string = '';
    let isComment = false;
    let startComment;
    let commentsLines = [];

    for (let strIndex = 0; strIndex < lines.length; ++strIndex) {
        if (isComment) {
            commentsLines.push(lines[strIndex - 1]);
        }

        string = lines[strIndex];

        let openedDouble = false;
        let opened = false;
        let previousEscape = false;
        let previousSlash = false;

        for (let i = 0; i < string.length; ++i) {
            if (string[i] === '"' && !opened && !openedDouble) {
                openedDouble = true;
            } else if (string[i] === '\'' && !opened && !openedDouble) {
                opened = true;
            } else if (string[i] === '"' && openedDouble && !previousEscape) {
                opened = false;
                openedDouble = false;
            } else if (string[i] === '\'' && opened && !previousEscape) {
                opened = false;
                openedDouble = false;
            } else if (string[i] === '"' && openedDouble && previousEscape) {
                previousEscape = false;
            } else if (string[i] === '\'' && opened && previousEscape) {
                previousEscape = false;
            } else {
                if (string[i] === '\\') {
                    previousEscape = true;
                }
                else if (string[i] === '/' && !previousSlash && !opened && !openedDouble) {
                    previousSlash = true;
                } else if (string[i] === '/' && previousSlash && !opened && !openedDouble) {
                    lines[strIndex] = lines[strIndex].substring(0, i - 1);
                    break;
                } else if (string[i] === '*' && previousSlash && !isComment && !opened && !openedDouble) {
                    isComment = true;
                    startComment = i - 1;
                } else if (string[i] === '*' && isComment && i + 1 < string.length && string[i + 1] === '/' && !opened && !openedDouble) {
                    let data = '';
                    let offset = 0;

                    for (let commentIndex = 0; commentIndex < commentsLines.length; ++commentIndex) {
                        data += commentsLines[commentIndex] + '\n';
                    }

                    offset = data.length;
                    data += lines[strIndex];

                    const before = data.substring(0, startComment);

                    let after = '';

                    if (offset + i + 2 < data.length) {
                        after = data.substring(offset + i + 2, data.length);
                    }

                    const target = strIndex - commentsLines.length;

                    while (strIndex > target) {
                        lines.splice(strIndex, 1);
                        strIndex--;
                    }

                    lines[strIndex] = before + after;
                    strIndex--;

                    isComment = false;
                    commentsLines = [];
                    startComment = 0;
                } else {
                    previousSlash = false;
                    previousEscape = false;
                }
            }
        }
    }
}

function removeQuotedData(string) {
    let data = '';
    let openedDouble = false;
    let opened = false;
    let previousEscape = false;
    for (let i = 0; i < string.length; ++i) {
        if (string[i] === '"' && !opened && !openedDouble) {
            openedDouble = true;
        } else if (string[i] === '\'' && !opened && !openedDouble) {
            opened = true;
        } else if (string[i] === '"' && openedDouble && !previousEscape) {
            opened = false;
            openedDouble = false;
        } else if (string[i] === '\'' && opened && !previousEscape) {
            opened = false;
            openedDouble = false;
        } else if (string[i] === '"' && openedDouble && previousEscape) {
            previousEscape = false;
        } else if (string[i] === '\'' && opened && previousEscape) {
            previousEscape = false;
        } else {
            if (string[i] === '\\') {
                previousEscape = true;
            } else {
                previousEscape = false;
            }
            data += string[i];
        }
    }
    return data;
}

function seekToFirstUnquotedSemicolon(string) {
    let data = '';
    let openedDouble = false;
    let opened = false;
    let previousEscape = false;

    for (let i = 0; i < string.length; ++i) {
        if (string[i] === '"' && !opened && !openedDouble) {
            openedDouble = true;
        } else if (string[i] === '\'' && !opened && !openedDouble) {
            opened = true;
        } else if (string[i] === '"' && openedDouble && !previousEscape) {
            opened = false;
            openedDouble = false;
        } else if (string[i] === '\'' && opened && !previousEscape) {
            opened = false;
            openedDouble = false;
        } else if (string[i] === '"' && openedDouble && previousEscape) {
            previousEscape = false;
        } else if (string[i] === '\'' && opened && previousEscape) {
            previousEscape = false;
        } else {
            if (string[i] === '\\') {
                previousEscape = true;
            } else {
                previousEscape = false;
            }
        }

        data += string[i];

        if (string[i] === ';' && !openedDouble && !opened) {
            break;
        }
    }

    return data;
}

; (async () => {
    const writtenFileSet = new Set();
    const boundaryMap = new Map();
    const importMap = new Map();

    for await (const f of getFiles(myArgs[0])) {
        if (f.includes(filePath)) {
            continue;
        } else if (f.includes(filePathSerialized)) {
            continue;
        } else if (f.includes(filePathNodeModules)) {
            continue;
        } else if (f.includes(filePathGit)) {
            continue;
        } else if (f.endsWith('component.js')) {
            const data = fs.readFileSync(f, { encoding: 'utf-8' });
            const lines = data.split(/\r?\n/);

            removeCommentsFromLines(lines);

            let processed = false;
            const importSet = new Set();

            for (let i = 0; i < lines.length; ++i) {
                if (lines[i].includes('import ')) {
                    let importStatement = lines[i].substring(lines[i].indexOf('import'), lines[i].length);
                    importStatement = seekToFirstUnquotedSemicolon(importStatement);
                    importSet.add(importStatement);
                }

                if (lines[i].includes('boundary')) {
                    console.log('Found boundary: ' + lines[i]);

                    const before = lines[i].substring(0, lines[i].indexOf('boundary'));
                    const startIndex = i;

                    if (before.trim().endsWith('}') || before.trim().length === 0) {
                        processed = true;
                        let open = 0;
                        let close = 1;

                        let after = '';
                        let fn = '';

                        let first = true;

                        do {
                            if (first) {
                                first = false;
                                after += lines[i].substring(lines[i].indexOf('boundary'), lines[i].length);
                            } else {
                                i++;
                                after += '\n';
                                after += lines[i].substring(0, lines[i].length);
                            }

                            let seekIndex = after.indexOf('{') + 1;
                            fn = after.substring(0, seekIndex);

                            let sans = removeQuotedData(fn);
                            open = occurrences(sans, '{', false);
                            close = occurrences(sans, '}', false);

                            while (open !== close && seekIndex < after.length) {
                                seekIndex++;
                                fn = after.substring(0, seekIndex);

                                sans = removeQuotedData(fn);
                                open = occurrences(sans, '{', false);
                                close = occurrences(sans, '}', false);
                            }
                        } while (open !== close);

                        const fnName = after.substring(0, after.indexOf('(')).trim();

                        const chunkIndex = crypto.createHash('sha256').update(f + fnName).digest('hex');

                        const afterFn = after.substring(fn.length, after.length);

                        const beforeFn = fn.substring(0, fn.indexOf('{') + 1);
                        const lastClose = fn.lastIndexOf('}');
                        let middleFn = fn.substring(fn.indexOf('{') + 1, lastClose);
                        const closeFn = fn.substring(lastClose, fn.length);

                        middleFn = ' import(/* webpackChunkName: "chunk' + chunkIndex + '" */ \'./chunk' + chunkIndex + '.js\').then(module => {'
                            + ' module.default(); });';

                        const middle = beforeFn + middleFn + closeFn;

                        while (i > startIndex) {
                            lines.splice(i, 1);
                            i--;
                        }

                        lines[startIndex] = before + middle + afterFn;

                        let modFileData = '';
                        for (let i = 0; i < lines.length; ++i) {
                            modFileData += lines[i] + '\n';
                        }

                        const fSubdirs = f.substring(dirname.length, f.length);
                        let pathToBuild = '';
                        for (let i = fSubdirs.length - 1; i >= 0; --i) {
                            if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                                pathToBuild = fSubdirs[i] + pathToBuild;
                                break;
                            } else {
                                pathToBuild = fSubdirs[i] + pathToBuild;
                            }
                        }
                        let filePathMod = path.join(filePath, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

                        if (!fs.existsSync(filePathMod)) {
                            fs.mkdirSync(filePathMod, { recursive: true });
                        }

                        const filePathChunk = path.join(filePathMod, 'chunk' + chunkIndex + '.js');

                        filePathMod = path.join(filePath, fSubdirs);
                        fs.writeFileSync(filePathMod, modFileData);

                        const fileData = 'export function ' + fn + ' export default ' + fnName + ';';
                        fs.writeFileSync(filePathChunk, fileData);

                        writtenFileSet.add(filePathChunk);
                        boundaryMap.set(filePathChunk, 'export function ' + fn);
                        importMap.set(filePathChunk, importSet);
                    }
                }
            }

            if (!processed) {
                const fSubdirs = f.substring(dirname.length, f.length);
                let pathToBuild = '';
                for (let i = fSubdirs.length - 1; i >= 0; --i) {
                    if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                        pathToBuild = fSubdirs[i] + pathToBuild;
                        break;
                    } else {
                        pathToBuild = fSubdirs[i] + pathToBuild;
                    }
                }
                let filePathMod = path.join(filePath, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

                if (!fs.existsSync(filePathMod)) {
                    fs.mkdirSync(filePathMod, { recursive: true });
                }

                filePathMod = path.join(filePath, fSubdirs);
                fs.copyFileSync(f, filePathMod);
            }
        } else {
            const fSubdirs = f.substring(dirname.length, f.length);
            let pathToBuild = '';
            for (let i = fSubdirs.length - 1; i >= 0; --i) {
                if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                    pathToBuild = fSubdirs[i] + pathToBuild;
                    break;
                } else {
                    pathToBuild = fSubdirs[i] + pathToBuild;
                }
            }
            let filePathMod = path.join(filePath, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

            if (!fs.existsSync(filePathMod)) {
                fs.mkdirSync(filePathMod, { recursive: true });
            }

            filePathMod = path.join(filePath, fSubdirs);
            fs.copyFileSync(f, filePathMod);
        }
    }

    ; (async () => {
        for await (const f of getFiles(myArgs[0])) {
            if (f.includes(filePathSerialized)) {
                continue;
            } else if (f.includes(filePath)) {
                continue;
            } else if (f.includes(filePathNodeModules)) {
                continue;
            } else if (f.includes(filePathGit)) {
                continue;
            } else if (f.endsWith('server.component.js')) {
                const data = fs.readFileSync(f, { encoding: 'utf-8' });
                const lines = data.split(/\r?\n/);

                removeCommentsFromLines(lines);

                let processed = false;

                const fnMap = new Map();

                for (let i = 0; i < lines.length; ++i) {
                    if (lines[i].includes('boundary')) {
                        console.log('Found boundary: ' + lines[i]);

                        const before = lines[i].substring(0, lines[i].indexOf('boundary'));

                        if (before.trim().endsWith('}') || before.trim().length === 0) {
                            processed = true;

                            const declaration = lines[i].substring(lines[i].indexOf('boundary'), lines[i].length);
                            const fnName = declaration.substring(0, declaration.indexOf('('));

                            let list = fnMap.get(f);

                            if (!list) {
                                list = [fnName];
                                fnMap.set(f, list);
                            } else {
                                list.push(fnName);
                                fnMap.set(f, list);
                            }
                        }
                    }
                }

                if (processed) {
                    processed = false;

                    for (let i = 0; i < lines.length; ++i) {
                        for (const [key, value] of fnMap) {
                            const originalIndex = i;

                            for (const name of value) {
                                const id = 'this.' + name;
                                if (lines[i].includes(id)) {
                                    let data = lines[i];
                                    const toRemoveIndices = [];

                                    while ((!data.includes(':') || !lines[i].includes('on')) && i > 0) {
                                        i--;
                                        toRemoveIndices.push(i);
                                        data += '\n' + lines[i];
                                    }

                                    let idIndex = data.indexOf(id);
                                    const startId = idIndex;

                                    let foundColon = false;
                                    let foundOn = false;
                                    let colonIndex = 0;

                                    while (idIndex > 0 && (foundColon === false || foundOn === false)) {
                                        idIndex--;
                                        if (data[idIndex] === ':') {
                                            const middle = data.substring(idIndex, startId).trim();
                                            if (middle.length === 0 || middle === ':') {
                                                foundColon = true;
                                                colonIndex = idIndex;
                                            }
                                        } else if (data[idIndex] === 'n' && foundColon) {
                                            if (idIndex > 0) {
                                                idIndex--;
                                                if (data[idIndex] === 'o') {
                                                    const middle = data.substring(idIndex, colonIndex).trim();
                                                    if (!middle.includes(' ') && !middle.includes(';')) {
                                                        foundOn = true;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    if (foundColon === true && foundOn === true) {
                                        let endIndex = startId;
                                        let foundEnd = false;
                                        let foundCloseParenthesis = false;
                                        let firstRun = true;
                                        let endIndexMod = 0;

                                        const startIndex = i;

                                        do {
                                            if (firstRun) {
                                                firstRun = false;
                                            } else {
                                                endIndexMod += lines[i].length;
                                                i++;
                                                data += '\n' + lines[i];
                                                toRemoveIndices.push(i);
                                                endIndex = 0;
                                            }

                                            while (endIndex < lines[i].length - 1) {
                                                endIndex++;
                                                if (lines[i][endIndex] === '}' || (foundCloseParenthesis && lines[i][endIndex] === ',')) {
                                                    foundEnd = true;
                                                    break;
                                                }
                                                else if (lines[i][endIndex] === ')') {
                                                    foundCloseParenthesis = true;
                                                }
                                            }
                                        }
                                        while (i < lines.length - 1 && !foundEnd);

                                        if (endIndex === lines[i].length) {
                                            foundEnd = true;
                                        }

                                        if (foundEnd) {
                                            endIndex += endIndexMod;

                                            const chunkIndex = crypto.createHash('sha256').update(f + name).digest('hex');

                                            const before = data.substring(0, startId);
                                            const after = data.substring(endIndex, data.length);
                                            const middle = '" import(\'./chunk' + chunkIndex + '.js\').then(module => {'
                                                + ' module.default(); });"';

                                            lines[startIndex] = before + middle + after;

                                            toRemoveIndices.forEach(index => {
                                                lines.splice(index, 1);
                                            });

                                            let modFileData = '';
                                            for (let i = 0; i < lines.length; ++i) {
                                                modFileData += lines[i] + '\n';
                                            }

                                            const fSubdirs = f.substring(dirname.length, f.length);
                                            let pathToBuild = '';
                                            for (let i = fSubdirs.length - 1; i >= 0; --i) {
                                                if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                                                    pathToBuild = fSubdirs[i] + pathToBuild;
                                                    break;
                                                } else {
                                                    pathToBuild = fSubdirs[i] + pathToBuild;
                                                }
                                            }
                                            let filePathMod = path.join(filePathSerialized, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

                                            if (!fs.existsSync(filePathMod)) {
                                                fs.mkdirSync(filePathMod, { recursive: true });
                                            }

                                            filePathMod = path.join(filePathSerialized, fSubdirs);
                                            fs.writeFileSync(filePathMod, modFileData);

                                            processed = true;
                                        }
                                    }
                                }
                            }

                            if (!processed) {
                                i = originalIndex;
                            }
                        }
                    }
                }

                if (!processed) {
                    const fSubdirs = f.substring(dirname.length, f.length);
                    let pathToBuild = '';
                    for (let i = fSubdirs.length - 1; i >= 0; --i) {
                        if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                            pathToBuild = fSubdirs[i] + pathToBuild;
                            break;
                        } else {
                            pathToBuild = fSubdirs[i] + pathToBuild;
                        }
                    }
                    let filePathMod = path.join(filePathSerialized, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

                    if (!fs.existsSync(filePathMod)) {
                        fs.mkdirSync(filePathMod, { recursive: true });
                    }

                    filePathMod = path.join(filePathSerialized, fSubdirs);
                    fs.copyFileSync(f, filePathMod);
                }
            } else if (f.endsWith(serverRoot)) {
                const fSubdirs = f.substring(dirname.length, f.length);
                let pathToBuild = '';
                for (let i = fSubdirs.length - 1; i >= 0; --i) {
                    if (fSubdirs[i] === '/' || fSubdirs[i] === '\\') {
                        pathToBuild = fSubdirs[i] + pathToBuild;
                        break;
                    } else {
                        pathToBuild = fSubdirs[i] + pathToBuild;
                    }
                }
                let filePathMod = path.join(filePathSerialized, fSubdirs.substring(0, fSubdirs.length - pathToBuild.length));

                if (!fs.existsSync(filePathMod)) {
                    fs.mkdirSync(filePathMod, { recursive: true });
                }

                filePathMod = path.join(filePathSerialized, fSubdirs);
                fs.copyFileSync(f, filePathMod);
            }
        }

        const dataMap = new Map();
        for (let filename of writtenFileSet) {
            const data = fs.readFileSync(filename, { encoding: 'utf-8' })
            const str = String(data);
            dataMap.set(filename, data);
        }

        for (let filename of writtenFileSet) {
            let data = '';
            let additionalData = '';

            const origData = dataMap.get(filename);

            for (const [key, value] of boundaryMap) {
                if (key === filename) {
                    continue;
                }

                additionalData += value;
            }

            additionalData = removeQuotedData(additionalData);
            additionalData += ' ' + removeQuotedData(origData);
            while (additionalData.includes('import')) {
                const before = additionalData.substring(0, additionalData.indexOf('import'));
                let after = additionalData.substring(additionalData.indexOf('import') + 6, additionalData.length);
                after = after.substring(after.indexOf(';') + 1, after.length);

                let middle = additionalData.substring(additionalData.indexOf('import'), additionalData.length);
                middle = middle.substring(0, middle.indexOf(';'));

                console.log('Removing import: \'' + middle + '\'');

                additionalData = before + ' ' + after;
            }

            const writtenImportSet = new Set();

            if (importMap.has(filename)) {
                const importSet = importMap.get(filename);

                if (importSet.size > 0) {
                    const tokenList = [];
                    const tokenMap = new Map();
                    const copiedNodeSet = new Set();

                    importSet.forEach(importStatement => {
                        const indexSingle = importStatement.indexOf('\'');
                        const indexDouble = importStatement.indexOf('"');

                        if (indexSingle < indexDouble || indexDouble === -1) {
                            let data = importStatement.substring(indexSingle + 1, importStatement.length);

                            if (data.includes('/')) {
                                data = data.substring(0, data.indexOf('/'));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            } else if (data.includes('\\')) {
                                data = data.substring(0, data.indexOf('\\'));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            } else {
                                data = data.substring(0, data.indexOf('\''));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            }
                        } else {
                            let data = importStatement.substring(indexDouble + 1, importStatement.length);

                            if (data.includes('/')) {
                                data = data.substring(0, data.indexOf('/'));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            } else if (data.includes('\\')) {
                                data = data.substring(0, data.indexOf('\\'));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            } else {
                                data = data.substring(0, data.indexOf('\''));
                                const dir = path.join(filePathNodeModules, data);
                                if (!copiedNodeSet.has(dir)) {
                                    copyFolderRecursiveSync(dir, filePathDistNodeModules);
                                    copiedNodeSet.add(dir);
                                }
                            }
                        }
                    });

                    importSet.forEach(importStatement => {
                        const statement = removeQuotedData(importStatement);
                        if (statement.includes('{') && statement.includes('}')) {
                            const idSet = new Set();
                            let id = statement.substring(statement.indexOf('{') + 1, statement.length);
                            id = id.substring(0, id.indexOf('}'));

                            if (id.includes(',')) {
                                const tokens = id.split(',');
                                for (let tokIndex = 0; tokIndex < tokens.length; ++tokIndex) {
                                    idSet.add(tokens[tokIndex].trim());
                                }
                            } else {
                                id = id.trim();
                                idSet.add(id);
                            }

                            idSet.forEach(id => {
                                tokenList.push(id);
                                tokenMap.set(id, importStatement);
                            })
                        } else {
                            let id = statement.substring(statement.indexOf('import') + 6, statement.length);
                            id = id.trim();
                            id = id.substring(0, id.indexOf(' '));

                            tokenList.push(id);
                            tokenMap.set(id, importStatement);
                        }
                    });

                    tokenList.sort((a, b) => {
                        return b.length - a.length ||
                            b.localeCompare(a);
                    });

                    importSet.forEach(importStatement => {
                        const statement = removeQuotedData(importStatement);
                        if (statement.includes('{') && statement.includes('}')) {
                            const idSet = new Set();
                            let id = statement.substring(statement.indexOf('{') + 1, statement.length);
                            id = id.substring(0, id.indexOf('}'));

                            if (id.includes(',')) {
                                const tokens = id.split(',');
                                for (let tokIndex = 0; tokIndex < tokens.length; ++tokIndex) {
                                    idSet.add(tokens[tokIndex].trim());
                                }
                            } else {
                                id = id.trim();
                                idSet.add(id);
                            }

                            let containsKey = false;

                            for (let key of idSet) {
                                const longList = [];
                                for (let longIndex = 0; longIndex < tokenList.length; ++longIndex) {
                                    if (tokenList[longIndex].includes(key) && tokenList[longIndex] !== key) {
                                        longList.push(tokenList[longIndex]);
                                    }
                                }

                                let foundLong = false;

                                for (let longIndex = 0; longIndex < longList.length; ++longIndex) {
                                    if (additionalData.includes(longList[longIndex])) {
                                        foundLong = true;
                                        containsKey = true;
                                        const replace = longList[longIndex];
                                        const re = new RegExp(replace, 'g');
                                        additionalData = additionalData.replace(re, '');

                                        const suppStatement = tokenMap.get(longList[longIndex]);
                                        if (!writtenImportSet.has(suppStatement)) {
                                            data += suppStatement + '\n';
                                            console.log('Import: ' + suppStatement);
                                            writtenImportSet.add(suppStatement);
                                        }
                                    }
                                }

                                if (foundLong) {
                                    break;
                                }

                                if (!foundLong && additionalData.includes(key)) {
                                    containsKey = true;
                                    const re = new RegExp(key, 'g');
                                    additionalData = additionalData.replace(re, '');
                                    break;
                                }
                            }

                            if (containsKey && !writtenImportSet.has(importStatement)) {
                                data += importStatement + '\n';
                                console.log('Import: ' + importStatement);
                                writtenImportSet.add(importStatement);
                            }
                        } else {
                            let id = statement.substring(statement.indexOf('import') + 6, statement.length);
                            id = id.trim();
                            id = id.substring(0, id.indexOf(' '));

                            let containsKey = false;

                            const longList = [];
                            for (let longIndex = 0; longIndex < tokenList.length; ++longIndex) {
                                if (tokenList[longIndex].includes(key) && tokenList[longIndex] !== key) {
                                    longList.push(tokenList[longIndex]);
                                }
                            }

                            let foundLong = false;

                            for (let longIndex = 0; longIndex < longList.length; ++longIndex) {
                                if (additionalData.includes(longList[longIndex])) {
                                    foundLong = true;
                                    containsKey = true;
                                    const replace = longList[longIndex];
                                    const re = new RegExp(replace, 'g');
                                    additionalData = additionalData.replace(re, '');

                                    const suppStatement = tokenMap.get(longList[longIndex]);
                                    if (!writtenImportSet.has(suppStatement)) {
                                        data += suppStatement + '\n';
                                        console.log('Import: ' + suppStatement);
                                        writtenImportSet.add(suppStatement);
                                    }
                                }
                            }

                            if (!foundLong && additionalData.includes(id)) {
                                containsKey = true;
                                const re = new RegExp(key, 'g');
                                additionalData = additionalData.replace(re, '');
                            }

                            if (containsKey && !writtenImportSet.has(importStatement)) {
                                data += importStatement + '\n';
                                console.log('Import: ' + importStatement);
                                writtenImportSet.add(importStatement);
                            }
                        }
                    });
                }
            }

            for (const [key, value] of boundaryMap) {
                if (key === filename) {
                    continue;
                }

                data += value;
            }

            fs.writeFileSync(filename, data + '\n' + origData);
        }
    })()
})()
