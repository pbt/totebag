import { getCssSelector } from "https://esm.sh/css-selector-generator";
import {
  keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
  rectangularSelection, crosshairCursor,
  lineNumbers, highlightActiveLineGutter, EditorView
} from "https://esm.sh/@codemirror/view"
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
  foldGutter, foldKeymap
} from "https://esm.sh/@codemirror/language"
import { defaultKeymap, history, historyKeymap } from "https://esm.sh/@codemirror/commands"
import { searchKeymap } from "https://esm.sh/@codemirror/search"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "https://esm.sh/@codemirror/autocomplete"
import { lintKeymap } from "https://esm.sh/@codemirror/lint"

function newCodeEditor(elem, anchor) {
  return new EditorView({
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
      ]),
    ],
    parent: anchor,
    doc: elem.innerHTML,
  });
}


class TotebagToolbar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <p>Hello from a web component!AAAA</p>
      <style>
        p {
          color: pink;
          font-weight: bold;
          padding: 1rem;
          border: 4px solid pink;
        }
      </style>
    `;
  }
}

customElements.define("totebag-toolbar", TotebagToolbar);


if (window.location.hostname === "localhost" && window.isSecureContext) {
  // const toolbar = document.createElement("totebag-toolbar");
  // toolbar.style.zIndex = 999;
  // toolbar.style.position = "fixed";

  // document.body.appendChild(toolbar);


  const editorDialog = document.createElement("dialog");
  editorDialog.style.width = "auto";
  editorDialog.style.height = "auto";

  editorDialog.style.inset = "5vmin";
  editorDialog.style.fontSize = "14px";

  document.body.appendChild(editorDialog);

  document.querySelectorAll("article").forEach(elem => {
    const toolbar = document.createElement("button");
    toolbar.style.position = "absolute";
    toolbar.style.display = "block";
    toolbar.style.border = "1px solid #000";
    toolbar.style.color = "#000";
    toolbar.style.background = "#fff";
    toolbar.style.font = "reset";
    toolbar.style.padding = "1ch";
    const rect = elem.getBoundingClientRect();
    toolbar.style.top = `${rect.top}px`;
    toolbar.style.left = `${rect.width}px`;

    toolbar.innerText = "edit";
    toolbar.addEventListener("click", () => {
      // get the computed dimensions
      const rect = elem.getBoundingClientRect();
      editorDialog.innerHTML = `<form method="dialog">
    <button>i'm done</button>
  </form>`;
      const editor = newCodeEditor(elem, editorDialog);
      editorDialog.showModal();
      editorDialog.addEventListener("close", () => {
        const exported = editor.state.doc.toString();
        // save it back
        elem.innerHTML = exported;
        // save this!
        const formData = new FormData();
        formData.append("selector", getCssSelector(elem));
        formData.append("body", exported);
        void fetch(`/__totebag/html/save?path=${location.pathname}`, { method: 'POST', body: formData });
      }, { once: true });
      // editorDialog.style.top = `${rect.top}px`;
      // editorDialog.style.bottom = `calc(100vh - ${rect.bottom}px)`;
      // editorDialog.style.left = `${rect.left}px`;
      // editorDialog.style.right = `calc(100vw - ${rect.right}px)`;
    })

    elem.parentElement.append(toolbar);

    // TODO: resize observer


    // TODO: resize 
  }
  );
}
// save back
