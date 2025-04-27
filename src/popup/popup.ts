import {initDom} from "../basic/domgen";
import {JsonHandle} from './jsonformat'
// 获取DOM元素

let jsonHandle: JsonHandle;
document.addEventListener('DOMContentLoaded', () => {
    const dom = initDom();
    jsonHandle = new JsonHandle(dom);

    //button点击事件
    jsonHandle.bindEvents();

    //对输入的json进行处理
    jsonHandle.handJsonAndShow();
});

