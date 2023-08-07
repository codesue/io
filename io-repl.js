/**
 * @license
 * Copyright 2023 Suzen Fylke
 * SPDX-License-Identifier: MIT
 */

const _PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';

const _INPUT_ID = 'io-repl-input';
const _OUTPUT_ID = 'io-repl-output';
const _RUN_BUTTON_ID = 'io-repl-run-button';

const _STYLE = `
:host {
  --margin: 0;
  --padding: 1em;

  display: block;
  line-height: 1.5;
}

button {
  cursor: var(--button-cursor, pointer);
  color: var(--button-text-color, white);
  background: var(--button-background-color, black);
  font-family: var(--button-font-family, inherit);
  font-size: var(--button-font-size, 0.875em);
  font-weight: var(--button-font-weight, 300);
  border: var(--button-border, none);
  border-radius: var(--button-border-radius, inherit);
  letter-spacing: var(--button-letter-spacing, 0.1em);
  padding: var(--button-padding, 0.5em 1em);
  margin: var(--button-margin, 1em var(--margin));
}

.io-repl-input,
.io-repl-input:disabled {
  width: 100%;
  min-height: 4em;
  resize: none;
  overflow: hidden;
  box-sizing: border-box;
  border: var(--input-border, 1px solid black);
  border-radius: var(--input-border-radius, inherit);
  background: var(--input-background-color, white);
  color: var(--input-text-color, black);
  font-family: var(--input-font-family, monospace);
  font-size: var(--input-font-size, 0.875em);
  font-weight: var(--input-font-weight, inherit);
  padding: var(--input-padding, 1em);
  margin: var(--input-margin, 0.5em var(--margin));
}

.io-repl-output {
  background: var(--output-background-color, inherit);
  color: var(--output-text-color, inherit);
  font-family: var(--output-font-family, monospace);
  font-size: var(--output-font-size, 0.875em);
  font-weight: var(--output-font-weight, inherit);
  padding: var(--output-padding, inherit);
  margin: var(--output-margin, 0.5em var(--margin));
}

.sr-only:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
`;

/**
 * Helper function to create the element's style.
 */
function _createStyle() {
  const style = document.createElement('style');
  style.textContent = _STYLE;
  return style;
}

/**
 * Helper function to create a button element. The element will have the form:
 * <button type='button' id='io-repl-run-button' class='io-repl-run-button'>
 *  Run
 * </button>
 */
function _createButton() {
  const button = document.createElement('button');
  button.setAttribute('part', 'button');
  button.setAttribute('type', 'button');
  button.setAttribute('id', _RUN_BUTTON_ID);
  button.setAttribute('class', _RUN_BUTTON_ID);
  button.textContent = 'Run';
  return button;
}

/**
 * Helper function to create a label element. The element will have the form:
 * <label for='io-repl-input' class='sr-only'>Input:</label>
 */
function _createLabel() {
  const label = document.createElement('label');
  label.setAttribute('part', 'label');
  label.setAttribute('for', _INPUT_ID);
  label.setAttribute('class', 'sr-only');
  label.textContent = 'Input:';
  return label;
}

/**
 * Helper function to create a textarea element. The element will have the form:
 * <textarea name='io-repl-input' id='io-repl-input' class='io-repl-input'>
 * </textarea>
 */
function _createTextarea() {
  const textarea = document.createElement('textarea');
  textarea.setAttribute('part', 'input');
  textarea.setAttribute('name', _INPUT_ID);
  textarea.setAttribute('id', _INPUT_ID);
  textarea.setAttribute('class', _INPUT_ID);
  return textarea;
}

/**
 * Helper function to create an input container element. The element will have
 * the form:
 * <form action='#'>...</form>
 */
function _createInputContainer() {
  const form = document.createElement('form');
  form.setAttribute('part', 'input-container');
  form.setAttribute('action', '#');
  form.appendChild(_createLabel());
  form.appendChild(_createTextarea());
  form.appendChild(_createButton());
  return form;
}

/**
 * Helper function to create a output container element. The element will have
 * the form:
 * <div id="io-repl-output" class="io-repl-output"></div>
 */
function _createOutputContainer() {
  const output = document.createElement('div');
  output.setAttribute('part', 'output');
  output.setAttribute('id', _OUTPUT_ID);
  output.setAttribute('class', _OUTPUT_ID);
  return output;
}

/**
 * Adds style and an event listener to enable dynamic height for the given
 * textarea element.
 */
function _enableDynamicHeight(textarea) {
  textarea.setAttribute('style', `height: ${textarea.scrollHeight}px;`);
  textarea.addEventListener('input', () => {
    textarea.setAttribute('style', 'height: auto;');
    textarea.setAttribute('style', `height: ${textarea.scrollHeight}px;`);
  });
}

/**
 * Adds event listeners to enable shift+enter keyboard shortcuts for the given
 * target element. This is meant to be used with content-editable elements like
 * textareas.
 */
function _enableKeyboardShortcuts(target, callback) {
  const shiftKey = 'Shift';
  const enterKey = 'Enter';
  const keysPressed = { [shiftKey]: false, [enterKey]: false };

  target.addEventListener('keydown', event => {
    if (event.key === shiftKey || event.key === enterKey) {
      keysPressed[event.key] = true;
    }
    if (keysPressed[shiftKey] && keysPressed[enterKey]) {
      event.preventDefault();
      callback();
      return true;
    }
    return false;
  });

  target.addEventListener('keyup', event => {
    if (event.key === shiftKey || event.key === enterKey) {
      keysPressed[event.key] = false;
    }
  });
}

/**
 * Dedents the given text by removing the common leading whitespace from each
 * line. This is a fork of PyScript's ltrim function:
 * https://github.com/pyscript/pyscript/blob/2023.05.1/pyscriptjs/src/utils.ts#L14-L27
 * PyScript is licensed under the Apache 2.0 License:
 * https://github.com/pyscript/pyscript/blob/main/LICENSE
 */
function _dedent(text) {
  const lines = text.split('\n');
  if (lines.length === 0) return text;

  const lengths = lines
    .filter(line => line.trim().length !== 0)
    .map(line => line.match(/^\s*/)?.pop()?.length);

  const k = Math.min(...lengths);

  return k !== 0 ? lines.map(line => line.substring(k)).join('\n') : text;
}

/**
 * Fetches the text from the given URL and returns it. Returns an empty string
 * if the fetch fails.
 */
async function _maybeFetchText(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch (err) {
    // pass
  }
  // eslint-disable-next-line no-console
  console.warn(`Failed to fetch text from ${url}.`);
  return '';
}

/**
 * Imports and loads Pyodide from the given source and returns the Pyodide
 * instance. Returns null if Pyodide fails to load.
 */
async function _loadPyodide(pyodideSource) {
  try {
    // eslint-disable-next-line import/no-unresolved
    await import(pyodideSource);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load Pyodide from ${pyodideSource}.`);
    return null;
  }

  // eslint-disable-next-line no-undef
  const pyodide = await loadPyodide();
  return pyodide;
}

/**
 * Evaluates the given Python code using the given Pyodide instance and returns
 * the output.
 */
async function _evaluatePythonCode(pyodide, code) {
  if (!code) {
    return '';
  }

  let output = '';
  const linebreak = '<br>';
  pyodide.setStdout({
    batched: content => {
      output += content + linebreak;
    },
  });
  pyodide.setStderr({
    batched: content => {
      output += content + linebreak;
    },
  });
  try {
    await pyodide.loadPackagesFromImports(code);
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined) {
      output += result + linebreak;
    }
  } catch (err) {
    output += err + linebreak;
  }
  return output;
}

export class IORepl extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(_createStyle());
    shadowRoot.appendChild(_createInputContainer());
    shadowRoot.appendChild(_createOutputContainer());
  }

  connectedCallback() {
    const button = this.shadowRoot.getElementById(_RUN_BUTTON_ID);
    const textarea = this.shadowRoot.getElementById(_INPUT_ID);
    const outputContainer = this.shadowRoot.getElementById(_OUTPUT_ID);
    this.pyodideSource = this.getAttribute('pyodide-src') || _PYODIDE_URL;
    this.buttonEnabled = !this.hasAttribute('disable-button');
    this.inputEnabled = !this.hasAttribute('disable-input');

    const _disableButton = () => {
      button.disabled = true;
      button.ariaDisabled = true;
      button.classList.add('sr-only');
    };

    const _disableInput = () => {
      textarea.disabled = true;
      textarea.ariaDisabled = true;
    };

    const _initInput = text => {
      textarea.value = _dedent(text).trim();
      _enableDynamicHeight(textarea);
    };

    const _onClickRun = () => {
      _evaluatePythonCode(this.pyodide, textarea.value).then(result => {
        outputContainer.innerHTML = result;
      });
    };

    if (this.hasAttribute('button-label')) {
      button.textContent = this.getAttribute('button-label');
    }

    if (this.hasAttribute('src')) {
      _maybeFetchText(this.getAttribute('src')).then(text => {
        _initInput(text);
      });
    } else {
      _initInput(this.textContent);
    }
    this.innerHTML = '';

    _loadPyodide(this.pyodideSource).then(pyodide => {
      this.pyodide = pyodide;
      if (pyodide !== null) {
        if (this.buttonEnabled) {
          button.addEventListener('click', _onClickRun);
        } else {
          _disableButton();
        }

        if (this.inputEnabled) {
          _enableKeyboardShortcuts(textarea, _onClickRun);
        } else {
          _disableInput();
        }

        if (this.hasAttribute('execute')) {
          _onClickRun();
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'Code editing and execution are disabled since Pyodide is not loaded.'
        );
        _disableInput();
        _disableButton();
      }
    });
  }
}

customElements.define('io-repl', IORepl);
