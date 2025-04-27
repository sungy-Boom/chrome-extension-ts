export interface DOMElements {
    jsonResult: HTMLDivElement;
    // messageDiv: HTMLDivElement;
    selectDiffModeButton: HTMLButtonElement;
    singleInputMode: HTMLDivElement;
    diffMode: HTMLDivElement;
    jsonInput: HTMLTextAreaElement;
    jsonInputLeft: HTMLTextAreaElement;
    jsonInputRight: HTMLTextAreaElement;
    compressButton: HTMLButtonElement;
}

export function initDom(): DOMElements {
    const getElement = <T extends HTMLElement>(id: string, type: new () => T): T => {
        const el = document.getElementById(id);
        if (!el || !(el instanceof type)) {
            console.log(id);
            throw new Error(`${id} not found or invalid type`);
        }
        return el;
    }
    return {
        jsonResult: getElement('jsonResult', HTMLDivElement),
        // messageDiv: getElement('messageDiv', HTMLDivElement),
        selectDiffModeButton: getElement('selectDiffMode', HTMLButtonElement),
        singleInputMode: getElement('singleInputMode', HTMLDivElement),
        diffMode: getElement('diffMode', HTMLDivElement),
        jsonInput: getElement('jsonInput', HTMLTextAreaElement),
        jsonInputLeft: getElement('jsonInputLeft', HTMLTextAreaElement),
        jsonInputRight: getElement('jsonInputRight', HTMLTextAreaElement),
        compressButton: getElement('compress', HTMLButtonElement),
    };
}