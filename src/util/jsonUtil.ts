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
            const isObjectEnd = line.trim().startsWith("}");
            const isArrayEnd = line.trim().startsWith("]");

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