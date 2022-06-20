import { LitElement } from 'lit';
import type { MyST } from 'mystjs';
declare global {
    interface Window {
        mystjs: {
            MyST: typeof MyST;
        };
    }
}
export declare class MystDemo extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    code: string;
    initial: string;
    previewType: string;
    result: string;
    ast: string;
    myst?: MyST;
    firstUpdated(): void;
    captureCode(): void;
    render(): import("lit-html").TemplateResult<1>;
    private onClick;
    private resizeTextArea;
    private reset;
    private onChange;
    private get inputEl();
    private copyToClipboard;
}
//# sourceMappingURL=myst-demo.d.ts.map