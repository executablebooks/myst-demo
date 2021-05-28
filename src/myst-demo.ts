/* eslint-disable import/extensions */
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { MyST } from 'markdown-it-myst';
import { customElement, property } from 'lit/decorators.js';
import hljs from 'highlight.js';
import { trim } from './utils';

@customElement('myst-demo')
export class MystDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      max-width: 800px;
      box-shadow: rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px, rgb(0 0 0 / 20%) 0px 3px 1px -2px;
      padding-top: 15px;
      margin: 20px 0px;
    }
    slot {
      background: red;
    }
    textarea {
      display: block;
      padding: 5px;
      border: none;
      border-radius: 0;
      border-top: 1px solid rgb(224, 224, 224);
      resize: none;
      width: calc(100% - 10px);
    }
    textarea:focus {
      outline: none;
    }
    button {
      position: absolute;
      top: 0px;
      right: 0px;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      background: rgb(224, 224, 224);
      outline: none;
      user-select: none;
    }
    #myst {
      position: relative;
    }
    #preview {
      min-height: 1em;
    }
  `;

  @property({ type: Number })
  rows = 4;

  @property({ type: String })
  code = '';

  #copyText = 'copy';

  showHTML = false;

  result = '';

  myst?: ReturnType<typeof MyST>;

  firstUpdated() {
    this.code = trim(this.innerHTML);
    this.myst = MyST();
    this.inputEl.value = this.code;
    this.onChange();
  }

  render() {
    const { showHTML } = this;
    let highlight = '';
    if (this.code) {
      const r = hljs.highlight(this.result, { language: 'html' });
      highlight = r.value;
    }
    return html`
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/xcode.min.css">
      <button @click="${this.onClick}">${showHTML ? 'preview' : 'html'}</button>
      <div id="preview" style="${!showHTML ? '' : 'display: none'}">
        <slot></slot>
      </div>
      <pre style="${showHTML ? '' : 'display: none'}"><code class="hljs html">${unsafeHTML(highlight)}</code></pre>
      <div id="myst">
        <button @click="${this.copyToClipboard}">${this.#copyText}</button>
        <textarea id="code" rows="${this.rows}" @input="${this.onChange}"></textarea>
      </div>
    `;
  }

  private onClick() {
    this.showHTML = !this.showHTML;
    this.requestUpdate();
  }

  private onChange() {
    this.result = this.myst?.render(this.inputEl.value) as string;
    this.innerHTML = this.result;
    (window as any).MathJax?.typesetPromise?.().then(() => this.inputEl.focus());
    this.requestUpdate();
    this.inputEl.focus();
  }

  private get inputEl(): HTMLInputElement {
    return this.shadowRoot!.getElementById('code')! as HTMLInputElement;
  }

  private copyToClipboard() {
    this.inputEl.focus();
    this.inputEl.setSelectionRange(0, this.inputEl.value.length);
    try {
      document.execCommand('copy');
      this.#copyText = 'done';
    } catch (err) {
      this.#copyText = 'error';
    }
    // Return to the copy button after a second.
    setTimeout(() => { this.#copyText = 'copy'; this.requestUpdate(); }, 1000);
    this.requestUpdate();
  }
}
