# About

Io is web component library for running Python codeblocks in the browser. Its
core element is `<io-repl>`, a mini Python REPL powered by [Pyodide](https://pyodide.org/en/stable/).

Try it out! Enter some Python code in the text area below and click the
<code>Run</code> button to execute it. You can also use <kbd>Shift</kbd> +
<kbd>Enter</kbd> to run the code.

<style>
  io-repl:not(:defined) {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  io-repl {
    --button-border-radius: 2px;
    --button-font-family: monospace;
    --input-border-radius: 2px;
  }
</style>
<script type='module' src='https://www.unpkg.com/io-repl/io-repl.js'></script>
<io-repl></io-repl>

## Quickasrt

Add the `<io-repl>` script to the head of your HTML document:

```html
<script type='module' src='https://www.unpkg.com/io-repl/io-repl.js'></script>
```

Add the following rule to your stylesheet to prevent the component from being
displayed until its ready:

```css
io-repl:not(:defined) {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
```

Use `<io-repl>` in your HTML document:

```html
<io-repl>import this</io-repl>
```

For a more comprehensive usage guide, refer to [Io's README](https://github.com/codesue/io#readme).

## License

Copyright &copy; 2023 [Suzen Fylke](https://suzenfylke.com). Distributed under
the MIT License.

## Acknowledgements

This project was scaffolded with [open-wc](https://github.com/open-wc/open-wc)'s
web component generator.

It forks PyScript's [ltrim](https://github.com/pyscript/pyscript/blob/2023.05.1/pyscriptjs/src/utils.ts#L14-L27)
function to dedent code input, and parts of its design are heavily influenced by
the design of PyScript's web components. PyScript is licensed under the
[Apache 2.0 License](https://github.com/pyscript/pyscript/blob/main/LICENSE).
