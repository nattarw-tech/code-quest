// Thin wrapper around CodeMirror 6, loaded as ES modules from esm.sh (no
// build step needed since this whole app is already served over http for
// Pyodide's sake). Falls back to a plain textarea if the CDN import fails
// (e.g. offline), so the game still works without syntax highlighting.

let cmModules = null;
let cmLoadFailed = false;

async function loadCodeMirror() {
  if (cmModules || cmLoadFailed) return cmModules;
  try {
    // Deliberately NOT using esm.sh's `?bundle` flag: that inlines each
    // package's dependencies into an isolated copy, so the EditorState
    // used here would be a different class instance than the one
    // `codemirror` uses internally -> "Unrecognized extension value"
    // errors. Without `?bundle`, esm.sh dedupes shared deps by version
    // across imports, so instanceof checks line up correctly.
    const [{ EditorView, basicSetup }, { EditorState }, { python }, { indentUnit }] = await Promise.all([
      import('https://esm.sh/codemirror@6.0.1'),
      import('https://esm.sh/@codemirror/state@6'),
      import('https://esm.sh/@codemirror/lang-python@6'),
      import('https://esm.sh/@codemirror/language@6'),
    ]);
    cmModules = { EditorView, basicSetup, EditorState, python, indentUnit };
    return cmModules;
  } catch (err) {
    console.warn('CodeMirror failed to load from CDN, falling back to plain textarea.', err);
    cmLoadFailed = true;
    return null;
  }
}

export class CodeEditor {
  constructor(hostEl) {
    this.hostEl = hostEl;
    this.view = null;
    this.textarea = null;
  }

  async mount(initialCode) {
    this.hostEl.innerHTML = '';
    const mods = await loadCodeMirror();

    if (!mods) {
      this.textarea = document.createElement('textarea');
      this.textarea.className = 'plain-editor';
      this.textarea.value = initialCode;
      this.textarea.spellcheck = false;
      this.textarea.style.cssText = 'width:100%;height:100%;min-height:220px;font-family:monospace;font-size:0.9rem;border:none;padding:0.6rem;resize:vertical;';
      this.hostEl.appendChild(this.textarea);
      return;
    }

    const { EditorView, basicSetup, EditorState, python, indentUnit } = mods;
    this.view = new EditorView({
      state: EditorState.create({
        doc: initialCode,
        extensions: [
          basicSetup,
          python(),
          indentUnit.of('    '),
          EditorView.lineWrapping,
          EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { overflow: 'auto' } }),
        ],
      }),
      parent: this.hostEl,
    });
  }

  getCode() {
    if (this.view) return this.view.state.doc.toString();
    if (this.textarea) return this.textarea.value;
    return '';
  }

  setCode(code) {
    if (this.view) {
      this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: code } });
    } else if (this.textarea) {
      this.textarea.value = code;
    }
  }

  highlightLine(lineNumber) {
    // Best-effort: plain textareas can't highlight a line; CodeMirror path
    // could add a decoration, but for now we keep this a no-op stub so
    // challenge-ui.js can call it unconditionally without branching.
  }
}
