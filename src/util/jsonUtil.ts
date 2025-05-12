//判断字符串是否是JSON

export function isValidJson(str: string): { isValid: boolean, error?: string } {
    try {
        const parsed = JSON.parse(str);

        // 额外检查是否是数组
        if (!Array.isArray(parsed) && typeof parsed !== 'object') {
            return {isValid: false, error: 'The JSON data is neither an object nor an array.'};
        }

        return {isValid: true};
    } catch (error) {
        return {isValid: false, error: error.message};
    }
}


/**
 * 排序 JSON 对象的键
 */
export function sortJsonKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(sortJsonKeys);
    }

    return Object.keys(obj)
        .sort()
        .reduce((sorted: Record<string, any>, key) => {
            sorted[key] = sortJsonKeys(obj[key]);
            return sorted;
        }, {});
}

/**
 * 生成带行号和语法高亮的 HTML
 */
export function formatWithHighlight(json: string): string {
    try {
        const parsed = JSON.parse(json);
        const sorted = sortJsonKeys(parsed);
        const formatted = JSON.stringify(sorted, null, 1);

        let lineNumber = 0;
        const processLine = (line: string, depth: number): string => {
            const leadingSpaces = line.match(/^\s*/)[0].replace(/ /g, '&nbsp;');
            const lineNum = `<span class="line-number">${lineNumber++}</span>`;

            // 检查是否是对象或数组的开始/结束
            const isObjectStart = line.trim().endsWith('{');
            const isArrayStart = line.trim().endsWith('[');

            let content = line;
            if (isObjectStart || isArrayStart) {
                const type = isObjectStart ? 'object' : 'array';
                const contentBeforeBrace = line.substring(0, line.length - 1);
                content = `${contentBeforeBrace}<span class="collapsible-toggle" data-type="${type}" data-depth="${depth}">${isObjectStart ? '{' : '['}</span>`;
            } else if (line.trim() === '},' || line.trim() === '}' || line.trim() === '],' || line.trim() === ']') {
                const type = line.trim() === '},' || line.trim() === '}' ? 'object' : 'array';
                content = `<span class="collapsible-toggle-end" data-type="${type}" data-depth="${depth}">${line}</span>`;
            }

            const highlighted = content
                .replace(/"([^"]+)":/g, '<span class="json-key">$1</span>:')
                .replace(/: ("[^"]+")/g, ': <span class="json-value-string">$1</span>')
                .replace(/: (\d+)/g, ': <span class="json-value-number">$1</span>')
                .replace(/: (true|false)/g, ': <span class="json-value-boolean">$1</span>')
                .replace(/: (null)/g, ': <span class="json-value-null">$1</span>');

            return `<div class="json-line" data-depth="${depth}">${lineNum} ${leadingSpaces}${highlighted}</div>`;
        };

        let depth = 0;
        const lines = formatted.split('\n');
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                const result = processLine(line, depth);
                depth++;
                return result;
            } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
                depth--;
                return processLine(line, depth);
            }
            return processLine(line, depth);
        });

        return processedLines.join('\n');
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}

export function formatWithHighlightV3(json: string): string {
    try {
        const parsed = JSON.parse(json);
        const sorted = sortJsonKeys(parsed);
        const formatted = JSON.stringify(sorted, null, 1);

        let lineNumber = 0;
        const processLine = (line: string, depth: number): string => {
            const leadingSpaces = line.match(/^\s*/)[0].replace(/ /g, '&nbsp;');
            const lineNum = `<span class="line-number">${lineNumber++}</span>`;

            // 检查是否是对象或数组的开始/结束
            const isObjectStart = line.trim().endsWith('{');
            const isArrayStart = line.trim().endsWith('[');

            let content = line;
            if (isObjectStart || isArrayStart) {
                const type = isObjectStart ? 'object' : 'array';
                const contentBeforeBrace = line.substring(0, line.length - 1);
                content = `${contentBeforeBrace}<span class="collapsible-toggle" data-type="${type}" data-depth="${depth}">${isObjectStart ? '{' : '['}</span>`;
            } else if (line.trim() === '},' || line.trim() === '}' || line.trim() === '],' || line.trim() === ']') {
                const type = line.trim() === '},' || line.trim() === '}' ? 'object' : 'array';
                content = `<span class="collapsible-toggle-end" data-type="${type}" data-depth="${depth}">${line}</span>`;
            }

            const highlighted = content
                .replace(/"([^"]+)":/g, '<span class="json-key">$1</span>:')
                .replace(/: ("[^"]+")/g, ': <span class="json-value-string">$1</span>')
                .replace(/: (\d+)/g, ': <span class="json-value-number">$1</span>')
                .replace(/: (true|false)/g, ': <span class="json-value-boolean">$1</span>')
                .replace(/: (null)/g, ': <span class="json-value-null">$1</span>');

            return `<div class="json-line" data-depth="${depth}">${lineNum} ${leadingSpaces}${highlighted}</div>`;
        };

        // let depth = 0;
        // const lines = formatted.split('\n');
        // //记录当前节点的key、索引
        // const keyOrIndexStack: (string | number)[] = [];
        // const typeObjOrArr: ("array" | "object")[] = []
        // const arrIndex: number[] = []
        //
        // const processedLines = lines.map(line => {
        //     const trimmed = line.trim();
        //     let keyMatch = trimmed.match(/^"([^"]+)":/);
        //     if (keyMatch) { //当前是json key
        //         keyOrIndexStack.push(keyMatch[1]);
        //     }
        //     if (trimmed.endsWith("{")) {
        //         typeObjOrArr.push("object");
        //         arrIndex.push(NaN);
        //     } else if (trimmed.endsWith("[")) {
        //         keyOrIndexStack.push(0);
        //         typeObjOrArr.push("array");
        //         arrIndex.push(0);//数组索引从0开始
        //     }
        //     console.log(keyOrIndexStack, arrIndex);
        //
        //     if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        //         const result = processLine(line, depth);
        //         depth++;
        //         return result;
        //     } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
        //         depth--;
        //         arrIndex.pop();
        //         if (typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'string') {
        //             keyOrIndexStack.pop();
        //         }
        //         return processLine(line, depth);
        //     } else if (typeObjOrArr[typeObjOrArr.length - 1] === 'array' && trimmed !== '[' && trimmed !== ']') {
        //         // 如果当前在数组中，且不是数组开始/结束行，则递增索引
        //         arrIndex[arrIndex.length - 1]++;
        //         // 保证 pathStack 的最后一项是当前索引
        //         if (typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'number') {
        //             keyOrIndexStack[keyOrIndexStack.length - 1] = arrIndex[arrIndex.length - 1] - 1;
        //         } else if (typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'string') {
        //             // 如果是 "key": [，则下一个元素是 0
        //             keyOrIndexStack.push(arrIndex[arrIndex.length - 1] - 1);
        //         }
        //     }
        //
        //     // arrIndex.pop();
        //     if (typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'string') {
        //         keyOrIndexStack.pop();
        //     }
        //     // 7. 如果是 "key": xxx, 这种普通键值对，渲染后弹出 key
        //     if (keyMatch && !trimmed.endsWith("{") && !trimmed.endsWith("[")) {
        //         keyOrIndexStack.pop();
        //     }
        //     return processLine(line, depth);
        // });
        let depth = 0;
        const lines = formatted.split('\n');
        const keyOrIndexStack: (string | number)[] = [];
        const typeObjOrArr: ("array" | "object")[] = [];
        const arrIndex: number[] = [];

        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            let keyMatch = trimmed.match(/^"([^"]+)":/);

            // 1. 处理key
            if (keyMatch) {
                const key = keyMatch[1];
                // 只有当这个key后面不是数组或对象的结束符时才加入堆栈
                if (!trimmed.match(/^"[^"]+":[\s]*[\}\]]?,?$/)) {
                    keyOrIndexStack.push(key);
                }
            }

            console.log('Path:', keyOrIndexStack.join(' -> '));
            console.log('Types:', typeObjOrArr);
            console.log('Array indices:', arrIndex);

            // 2. 处理对象和数组的开始
            if (trimmed.endsWith("{")) {
                typeObjOrArr.push("object");
                arrIndex.push(NaN);
                const result = processLine(line, depth);
                depth++;
                return result;
            } else if (trimmed.endsWith("[")) {
                typeObjOrArr.push("array");
                arrIndex.push(0);
                const result = processLine(line, depth);
                depth++;
                return result;
            }

            // 3. 处理对象和数组的结束
            if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
                depth--;
                const currentType = typeObjOrArr[typeObjOrArr.length - 1];
                typeObjOrArr.pop();
                arrIndex.pop();

                // 如果当前结束的是对象或数组，需要弹出对应的key
                if (keyOrIndexStack.length > 0) {
                    const lastItem = keyOrIndexStack[keyOrIndexStack.length - 1];
                    if (typeof lastItem === 'number' ||
                        (typeof lastItem === 'string' && currentType === 'object')) {
                        keyOrIndexStack.pop();
                    }
                }
                return processLine(line, depth);
            }

            // 4. 处理数组元素
            const isInArray = typeObjOrArr[typeObjOrArr.length - 1] === 'array';
            if (isInArray && !trimmed.startsWith('[') && !trimmed.startsWith(']')) {
                const currentIndex = arrIndex[arrIndex.length - 1];

                // 更新路径堆栈中的索引
                if (typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'number') {
                    keyOrIndexStack[keyOrIndexStack.length - 1] = currentIndex;
                } else {
                    keyOrIndexStack.push(currentIndex);
                }

                // 如果当前行是一个完整的元素（以逗号结束或是对象/数组的开始）
                if (trimmed.endsWith(',') || trimmed.endsWith('{') || trimmed.endsWith('[')) {
                    arrIndex[arrIndex.length - 1]++; // 增加索引计数
                }
            }

            // 5. 处理普通键值对（叶子节点）
            if (keyMatch && trimmed.match(/^"[^"]+":[\s]*[^{\[].+[,]?$/)) {
                const result = processLine(line, depth);
                // 如果是普通键值对，处理完后弹出key
                if (keyOrIndexStack.length > 0 &&
                    typeof keyOrIndexStack[keyOrIndexStack.length - 1] === 'string' &&
                    !isInArray) { // 如果在数组中，不要弹出key
                    keyOrIndexStack.pop();
                }
                return result;
            }

            return processLine(line, depth);
        });

        return processedLines.join('\n');
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}

export function formatWithHighlightV2(json: string): string {
    try {
        const parsed = JSON.parse(json);
        const sorted = sortJsonKeys(parsed);
        const formatted = JSON.stringify(sorted, null, 1);

        let lineNumber = 0;

        // 路径栈，记录当前对象/数组的 key 或索引
        const pathStack: (string | number)[] = [];
        // 类型栈，记录当前层是对象还是数组
        const typeStack: ('object' | 'array')[] = [];

        // 辅助函数：格式化路径
        function formatFullPath(stack: (string | number)[]) {
            let path = '';
            for (let i = 0; i < stack.length; i++) {
                if (typeof stack[i] === 'string') {
                    if (i > 0) path += '.';
                    path += stack[i];
                } else if (typeof stack[i] === 'number') {
                    path += `[${stack[i]}]`;
                }
            }
            return path;
        }

        // 处理每一行
        const lines = formatted.split('\n');
        let arrayIndexStack: number[] = []; // 跟踪每层数组的当前索引

        const processedLines = lines.map(line => {
            const trimmed = line.trim();

            // 1. 进入对象或数组前，先处理 key
            let keyMatch = trimmed.match(/^"([^"]+)":/);
            let isObjectStart = trimmed.endsWith('{');
            let isArrayStart = trimmed.endsWith('[');

            // 进入对象或数组前，先推 key
            if (keyMatch) {
                // 如果是 "key": { 或 "key": [
                pathStack.push(keyMatch[1]);
            }

            // 2. 进入对象
            if (isObjectStart) {
                typeStack.push('object');
                arrayIndexStack.push(NaN); // 用 NaN 占位，表示不是数组
            }
            // 3. 进入数组
            else if (isArrayStart) {
                typeStack.push('array');
                arrayIndexStack.push(0); // 新数组，索引从0开始
            }

            // 4. 处理当前行的路径
            let path = formatFullPath(pathStack.map((k, i) => {
                if (typeStack[i] === 'array') {
                    return typeof k === 'string' ? `${k}` : k;
                }
                return k;
            }));

            console.log(path);

            // 5. 渲染行
            const leadingSpaces = line.match(/^\s*/)[0].replace(/ /g, '&nbsp;');
            const lineNum = `<span class="line-number">${lineNumber++}</span>`;

            let content = line;
            if (isObjectStart || isArrayStart) {
                const type = isObjectStart ? 'object' : 'array';
                const contentBeforeBrace = line.substring(0, line.length - 1);
                content = `${contentBeforeBrace}<span class="collapsible-toggle" data-type="${type}" data-depth="${typeStack.length - 1}">${isObjectStart ? '{' : '['}</span>`;
            } else if (trimmed === '},' || trimmed === '}' || trimmed === '],' || trimmed === ']') {
                const type = (trimmed === '},' || trimmed === '}') ? 'object' : 'array';
                content = `<span class="collapsible-toggle-end" data-type="${type}" data-depth="${typeStack.length - 1}">${line}</span>`;
            }

            const highlighted = content
                .replace(/"([^"]+)":/g, '<span class="json-key">$1</span>:')
                .replace(/: ("[^"]+")/g, ': <span class="json-value-string">$1</span>')
                .replace(/: (\d+)/g, ': <span class="json-value-number">$1</span>')
                .replace(/: (true|false)/g, ': <span class="json-value-boolean">$1</span>')
                .replace(/: (null)/g, ': <span class="json-value-null">$1</span>');

            const html = `<div class="json-line" data-depth="${typeStack.length - 1}">${lineNum} ${leadingSpaces}${highlighted}</div>`;

            // 6. 离开对象或数组，弹栈
            if (trimmed === '},' || trimmed === '}') {
                typeStack.pop();
                arrayIndexStack.pop();
                if (typeof pathStack[pathStack.length - 1] === 'string') {
                    pathStack.pop();
                }
            } else if (trimmed === '],' || trimmed === ']') {
                typeStack.pop();
                arrayIndexStack.pop();
                if (typeof pathStack[pathStack.length - 1] === 'string') {
                    pathStack.pop();
                }
            } else if (typeStack[typeStack.length - 1] === 'array' && trimmed !== '[' && trimmed !== ']') {
                // 如果当前在数组中，且不是数组开始/结束行，则递增索引
                arrayIndexStack[arrayIndexStack.length - 1]++;
                // 保证 pathStack 的最后一项是当前索引
                if (typeof pathStack[pathStack.length - 1] === 'number') {
                    pathStack[pathStack.length - 1] = arrayIndexStack[arrayIndexStack.length - 1] - 1;
                } else if (typeof pathStack[pathStack.length - 1] === 'string') {
                    // 如果是 "key": [，则下一个元素是 0
                    pathStack.push(arrayIndexStack[arrayIndexStack.length - 1] - 1);
                }
            }

            // 7. 如果是 "key": xxx, 这种普通键值对，渲染后弹出 key
            if (keyMatch && !isObjectStart && !isArrayStart) {
                pathStack.pop();
            }

            return html;
        });

        return processedLines.join('\n');
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}

function renderHtmlByEachLine(line: string, lineNumber: number, depth: number) {
    const leadingSpaces = line.match(/^\s*/)[0].replace(/ /g, '&nbsp;');
    const lineNum = `<span class="line-number">${lineNumber++}</span>`;

    // 检查是否是对象或数组的开始/结束
    const isObjectStart = line.trim().endsWith('{');
    const isArrayStart = line.trim().endsWith('[');

    let content = line;
    if (isObjectStart || isArrayStart) {
        const type = isObjectStart ? 'object' : 'array';
        const contentBeforeBrace = line.substring(0, line.length - 1);
        content = `${contentBeforeBrace}<span class="collapsible-toggle" data-type="${type}" data-depth="${depth}">${isObjectStart ? '{' : '['}</span>`;
    } else if (line.trim() === '},' || line.trim() === '}' || line.trim() === '],' || line.trim() === ']') {
        const type = line.trim() === '},' || line.trim() === '}' ? 'object' : 'array';
        content = `<span class="collapsible-toggle-end" data-type="${type}" data-depth="${depth}">${line}</span>`;
    }

    const highlighted = content
        .replace(/"([^"]+)":/g, '<span class="json-key">$1</span>:')
        .replace(/: ("[^"]+")/g, ': <span class="json-value-string">$1</span>')
        .replace(/: (\d+)/g, ': <span class="json-value-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-value-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-value-null">$1</span>');

    return `<div class="json-line" data-depth="${depth}">${lineNum} ${leadingSpaces}${highlighted}</div>`;
}

// 辅助函数：格式化路径
function formatFullPath(stack: (string | number)[]) {
    let path = '';
    for (let i = 0; i < stack.length; i++) {
        if (typeof stack[i] === 'string') {
            if (i > 0) path += '.';
            path += stack[i];
        } else if (typeof stack[i] === 'number') {
            path += `[${stack[i]}]`;
        }
    }
    return path;
}

/**
 * json压缩
 * @param json
 */
export function compressJson(json: string): string {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed);
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}

/**
 * json转义
 * @param json
 */
export function escapeJson(json: string): string {
    try {
        // 先解析确保是有效的JSON
        const parsed = JSON.parse(json);
        json = JSON.stringify(parsed)
        // 对特殊字符进行转义
        return json.replace(/[\\"']/g, '\\$&')
            .replace(/\u0000/g, '\\0')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}

/**
 * json去除转义
 * @param json
 */
export function unescapeJson(json: string): string {
    try {
        // 先解析确保是有效的JSON
        const parsed = JSON.parse(json);
        json = JSON.stringify(parsed)
        // 去除转义字符
        return json.replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\0/g, '\u0000')
            .replace(/\\(["'])/g, '$1');
    } catch (error) {
        console.error('Invalid JSON:', error);
        return '<div class="json-error">Invalid JSON</div>';
    }
}