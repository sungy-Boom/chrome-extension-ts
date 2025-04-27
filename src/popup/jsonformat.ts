import {DOMElements} from '../basic/domgen'
import {compressJson, escapeJson, formatWithHighlight, isValidJson, unescapeJson} from "../util/jsonUtil";

enum ButtonSelectStatus {
    FORMAT = 0, //格式化
    COMPRESS = 1, //压缩
    ESCAPE = 2, //转义
    UNESCAPE = 3, //去除转义
    DIFF = 4, //json对比
}

export class JsonHandle {
    public domc: DOMElements;
    public diffStatus: ButtonSelectStatus;

    constructor(initializedDom: DOMElements) {
        this.diffStatus = ButtonSelectStatus.FORMAT;
        this.domc = initializedDom;
    }

    public bindEvents() {
        const actions = ['format', 'compress', 'escape', 'unescape', 'selectDiffMode'];
        actions.forEach(id => {
            document.getElementById(id)?.addEventListener('click', this.resetEditorToSingleInput.bind(this));
        });
    }

    //点击不同button的时候，页面重新渲染
    private resetEditorToSingleInput(event: Event) {
        const currentButton = event.target as HTMLElement;
        const elementId = currentButton.id;
        console.log(elementId);
        if (elementId === 'format') {
            this.diffStatus = ButtonSelectStatus.FORMAT;
        } else if (elementId === 'compress') {
            this.diffStatus = ButtonSelectStatus.COMPRESS;
        } else if (elementId === 'escape') {
            this.diffStatus = ButtonSelectStatus.ESCAPE;
        } else if (elementId === 'unescape') {
            this.diffStatus = ButtonSelectStatus.UNESCAPE;
        } else if (elementId === 'selectDiffMode') {
            this.diffStatus = ButtonSelectStatus.DIFF;
        }
        console.log(this.diffStatus);

        const actions = ['format', 'compress', 'escape', 'unescape', 'selectDiffMode'];
        actions.forEach(id => {
            const button = document.getElementById(id);
            button?.classList.remove('selected');
        });
        currentButton.classList.add('selected');

        if (this.diffStatus != ButtonSelectStatus.DIFF) {
            console.log("input trigger ", elementId);
            // 切换到对比模式
            this.domc.diffMode.style.display = 'none';
            this.domc.singleInputMode.style.display = 'flex';

            // 触发一次输入事件，以更新显示结果
            const inputEvent = new Event('input');
            this.domc.jsonInput.dispatchEvent(inputEvent);
            return;
        }

        this.clickDiffButton();
    }

    public clickDiffButton() {
        this.diffStatus = ButtonSelectStatus.DIFF;
        // 切换到对比模式
        this.domc.singleInputMode.style.display = 'none';
        this.domc.diffMode.style.display = 'flex';
        this.domc.selectDiffModeButton.textContent = '退出对比';
        // 如果有原始内容，复制到左侧输入框
        this.domc.jsonInputLeft.value = this.domc.jsonInput.value;

        this.diffInputAndShow();
    }

    //输入事件触发时，进行json格式化
    public handJsonAndShow() {
        this.domc.jsonInput.addEventListener('input', () => {
            console.log("input trigger");
            const json = this.domc.jsonInput.value;
            if (json === '') {
                this.domc.jsonResult.innerHTML = '输入JSON';
                return;
            }
            const validRes = isValidJson(json);
            if (!validRes.isValid) {
                this.domc.jsonResult.innerHTML = '<span class="json-key">validRes.error</span>';
                return;
            }
            switch (this.diffStatus) {
                case ButtonSelectStatus.FORMAT:
                    this.domc.jsonResult.innerHTML = formatWithHighlight(json);
                    // 确保在 DOM 更新后设置折叠处理器
                    setTimeout(() => this.setupCollapsibleHandlers(), 0);
                    break;
                case ButtonSelectStatus.COMPRESS:
                    this.domc.jsonResult.innerHTML = compressJson(json);
                    break;
                case ButtonSelectStatus.ESCAPE:
                    this.domc.jsonResult.innerHTML = escapeJson(json);
                    break;
                case ButtonSelectStatus.UNESCAPE:
                    this.domc.jsonResult.innerHTML = unescapeJson(json);
                    break;
            }
        });
    }

    private setupCollapsibleHandlers() {
        const toggles = this.domc.jsonResult.getElementsByClassName('collapsible-toggle');
        Array.from(toggles).forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                const depth = parseInt(target.getAttribute('data-depth') || '0');

                // 切换折叠状态
                target.classList.toggle('collapsed');
                const isCollapsed = target.classList.contains('collapsed');

                // 获取所有行
                const lines = this.domc.jsonResult.getElementsByClassName('json-line');
                const linesArray = Array.from(lines) as HTMLElement[];

                // 找到当前点击的行
                const currentLine = target.closest('.json-line');
                if (!currentLine) return;

                const currentIndex = linesArray.indexOf(currentLine as HTMLElement);
                if (currentIndex === -1) return;

                // 找到匹配的结束标记
                let endIndex = -1;

                for (let i = currentIndex + 1; i < linesArray.length; i++) {
                    const line = linesArray[i];
                    const lineDepth = parseInt(line.getAttribute('data-depth') || '0');
                    if (lineDepth === depth) { //找到第一个depth相等的位置
                        endIndex = i;
                        break;
                    }
                }

                if (endIndex === -1) return;

                // 折叠/展开范围内的内容
                for (let i = currentIndex + 1; i < endIndex; i++) {
                    const line = linesArray[i];
                    const lineDepth = parseInt(line.getAttribute('data-depth') || '0');

                    if (lineDepth > depth) {
                        line.style.display = isCollapsed ? 'none' : 'block';
                    }
                }
            });
        });
    }

    public diffInputAndShow() {
        this.domc.jsonInputLeft.addEventListener('input', () => {
            this.diffAndShow();
        });
        this.domc.jsonInputRight.addEventListener('input', () => {
            this.diffAndShow();
        })
    }

    private diffAndShow() {
        const left = this.domc.jsonInputLeft.value;
        const right = this.domc.jsonInputRight.value;

        let leftHtml = '';
        let rightHtml = '';

        try {
            const leftJson = JSON.stringify(JSON.parse(left), null, 1);
            const rightJson = JSON.stringify(JSON.parse(right), null, 1);

            leftHtml = this.diffJson(leftJson, rightJson, 'left');
            rightHtml = this.diffJson(leftJson, rightJson, 'right');
        } catch (e) {
            leftHtml = '<span style="color:red;">JSON格式错误</span>';
            rightHtml = '<span style="color:red;">JSON格式错误</span>';
        }
        console.log(leftHtml);
        this.domc.jsonInputLeft.innerHTML = leftHtml;
        this.domc.jsonInputRight.innerHTML = rightHtml;
    }

    /**
     * 递归对比两个json，生成带颜色的html
     * @param left 左侧json
     * @param right 右侧json
     * @param side 'left' | 'right'
     */
    private diffJson(left: any, right: any, side: 'left' | 'right'): string {
        if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
            if (left === right) {
                return `<span>${JSON.stringify(side === 'left' ? left : right)}</span>`;
            } else {
                // value不一致
                return `<span class="value-diff" style="background:yellow;">${JSON.stringify(side === 'left' ? left : right)}</span>`;
            }
        }

        const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);
        console.log(keys);
        let html = '{<br>';
        for (const key of keys) {
            const l = left ? left[key] : undefined;
            const r = right ? right[key] : undefined;

            if (!(key in left)) {
                // 新增字段
                if (side === 'right') {
                    html += `<span class="value-add" style="background:lightgreen;">"${key}": ${this.diffJson(l, r, side)}</span>,<br>`;
                }
            } else if (!(key in right)) {
                // 删除字段
                if (side === 'left') {
                    html += `<span class="value-deleted" style="background:#ffb3b3;">"${key}": ${this.diffJson(l, r, side)}</span>,<br>`;
                }
            } else {
                // key都存在
                const valueHtml = this.diffJson(l, r, side);
                if (typeof l === 'object' && typeof r === 'object') {
                    html += `"${key}": ${valueHtml},<br>`;
                } else if (l !== r) {
                    html += `<span style="background:yellow;">"${key}": ${valueHtml}</span>,<br>`;
                } else {
                    html += `"${key}": ${valueHtml},<br>`;
                }
            }
        }
        html += '}';
        return html;
    }
}