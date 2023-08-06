/**
 * @license
 * Copyright 2023 Suzen Fylke
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable max-classes-per-file */
import { expect, fixture, html } from '@open-wc/testing';

import '../io-repl.js';

describe('IoRepl', () => {
  it('passes the accessibility audit', async () => {
    const el = await fixture(html`<io-repl></io-repl>`);

    await expect(el).shadowDom.to.be.accessible();
  });

  it('uses its text content as the initial input value', async () => {
    const el = await fixture(
      html`<io-repl><code>print('Hello, world!')</code></io-repl>`
    );
    const textarea = el.shadowRoot.getElementById('io-repl-input');

    expect(textarea.value).to.equal(`print('Hello, world!')`);
  });

  it('applies attributes', async () => {
    let el = await fixture(html`<io-repl></io-repl>`);
    expect(el.buttonEnabled).to.equal(true);
    expect(el.inputEnabled).to.equal(true);
    expect(
      el.shadowRoot.getElementById('io-repl-run-button').textContent
    ).to.equal('Run');
    expect(el.pyodideSource).to.equal(
      'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js'
    );

    el = await fixture(html`
      <io-repl
        disable-button
        disable-input
        button-label="Play"
        pyodide-src="https://path/to/pyodide.js"
      >
      </io-repl>
    `);
    expect(el.buttonEnabled).to.equal(false);
    expect(el.inputEnabled).to.equal(false);
    expect(
      el.shadowRoot.getElementById('io-repl-run-button').textContent
    ).to.equal('Play');
    expect(el.pyodideSource).to.equal('https://path/to/pyodide.js');
  });
});
