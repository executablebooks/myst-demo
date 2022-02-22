/* eslint-disable import/extensions */
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import yaml from 'js-yaml';
import { customElement } from 'lit/decorators.js';
import hljs from 'highlight.js';
import type { MyST } from 'mystjs';
import { trim } from './utils';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    myst: { MyST: typeof MyST };
  }
}

@customElement('myst-demo')
export class MystDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      max-width: 800px;
      box-shadow: rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px,
        rgb(0 0 0 / 20%) 0px 3px 1px -2px;
      margin: 20px;
      border-radius: 3px;
      overflow: hidden;
      padding: 0 !important;
    }
    slot {
      background: red;
    }
    textarea {
      display: block;
      padding: 5px;
      border-radius: 0;
      border: 1px solid rgb(224, 224, 224);
      resize: none;
      width: calc(100% - 10px);
      padding: 1.5em;
      font-size: 1.2em;
      width: calc(100% - 3em);
      font-family: monospace;
      background: whitesmoke;
      color: rgb(4, 81, 165);
    }
    textarea:focus {
      outline: none;
    }
    .buttons {
      position: absolute;
      top: -1px;
      border: 1px solid #333;
    }
    .left {
      left: 0px;
    }
    .right {
      right: -1px;
    }
    button {
      text-transform: uppercase;
      font-size: 1em;
      border: none;
      cursor: pointer;
      outline: none;
      user-select: none;
      float: right;
      background: white;
    }
    button:hover {
      background: #f7f8fa;
    }
    .myst {
      position: relative;
    }
    .preview {
      position: relative;
      min-height: 1em;
      padding: 15px;
    }
    .previewSlot {
      margin-top: 1em;
    }
  `;

  code = '';

  initial = '';

  #copyText = 'copy';

  previewType = 'preview';

  result = '';

  ast = '';

  myst?: MyST;

  firstUpdated() {
    if (document.readyState === 'interactive') {
      this.captureCode();
    } else {
      window.addEventListener('load', () => this.captureCode());
    }
  }

  captureCode() {
    const code = trim(this.innerHTML);
    this.code = code;
    this.initial = code;
    this.inputEl.value = this.code;
    this.onChange(false);
  }

  render() {
    const { previewType } = this;
    const htmlCode = hljs.highlight(this.result ?? '', { language: 'html' }).value;
    const yamlCode = hljs.highlight(this.ast ?? '', { language: 'yaml' }).value;
    setTimeout(() => this.resizeTextArea(), 0);
    const background = 'background: #355E9A; color: white;';
    const changed = this.code !== this.initial;
    return html`
      <link
        rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/xcode.min.css"
      />
      <div class="myst">
        <div class="buttons right">
          <button @click="${this.copyToClipboard}">${this.#copyText}</button>
          ${changed ? html`<button @click="${this.reset}">RESET</button>` : ''}
        </div>
        <textarea id="code" @input="${this.onChange}"></textarea>
      </div>
      <div class="preview">
        <div class="buttons left">
          <button
            style="${previewType === 'html' ? background : ''}"
            @click="${() => this.onClick('html')}"
          >
            HTML
          </button>
          <button
            style="${previewType === 'ast' ? background : ''}"
            @click="${() => this.onClick('ast')}"
          >
            AST
          </button>
          <button
            style="${previewType === 'preview' ? background : ''}"
            @click="${() => this.onClick('preview')}"
          >
            DEMO
          </button>
        </div>
        <div class="previewSlot" style="${previewType === 'preview' ? '' : 'display: none'}">
          <slot></slot>
        </div>
        <pre
          style="${previewType === 'ast' ? '' : 'display: none'}"
        ><code class="hljs yaml">${unsafeHTML(yamlCode)}</code></pre>
        <pre
          style="${previewType === 'html' ? '' : 'display: none'}"
        ><code class="hljs html">${unsafeHTML(htmlCode)}</code></pre>
      </div>
    `;
  }

  private onClick(type: string) {
    this.previewType = type;
    this.requestUpdate();
  }

  private resizeTextArea() {
    const el = this.shadowRoot?.getElementById('code');
    if (!el) return;
    el.style.cssText = 'height:auto; padding:0';
    el.style.cssText = `height:${el.scrollHeight}px`;
  }

  private reset() {
    this.inputEl.value = this.initial;
    this.onChange();
  }

  // Note, that first arg is also an event handler above
  private async onChange(focus = true) {
    this.code = this.inputEl.value;
    if (!window.myst.MyST) {
      this.requestUpdate();
      throw new Error('Could not find MyST parser on window.');
    }
    this.myst = this.myst ?? new window.myst.MyST();
    this.ast = yaml.dump(this.myst?.parse(this.code));
    this.result = (await this.myst?.render(this.code)) as string;
    this.innerHTML = this.result;
    (window as any).MathJax?.typesetPromise?.().then(() => {
      if (focus !== false) this.inputEl.focus();
    });
    this.requestUpdate();
    if (focus !== false) this.inputEl.focus();
  }

  private get inputEl(): HTMLInputElement {
    return this.shadowRoot!.getElementById('code')! as HTMLInputElement;
  }

  private async copyToClipboard() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.inputEl.value);
      } else {
        this.inputEl.focus();
        this.inputEl.setSelectionRange(0, this.inputEl.value.length);
        document.execCommand('copy');
      }
      this.#copyText = 'done';
    } catch (err) {
      this.#copyText = 'error';
    }
    // Return to the copy button after a second.
    setTimeout(() => {
      this.#copyText = 'copy';
      this.requestUpdate();
    }, 1000);
    this.requestUpdate();
  }
}
