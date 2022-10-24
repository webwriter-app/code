import "@shoelace-style/shoelace/dist/themes/light.css"
import { LitElementWw } from "@webwriter/lit"
import { property, customElement } from "lit/decorators.js"
import { EditorView } from "codemirror"
import { EditorState, Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { style } from "./ww-code-cell-css"
import { html } from "lit"
import { mySetup } from "./codemirror"
import readOnlyRangesExtension from 'codemirror-readonly-ranges'
import { autocompletion } from '@codemirror/autocomplete';
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox"
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item"
import SlButton from "@shoelace-style/shoelace/dist/components/button/button"
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider"



//part=action einfügen

@customElement("ww-code-cell")
export default class CodeCell extends LitElementWw {
  static styles = style;

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = true;

  @property({ type: Boolean, reflect: true, attribute: true })
  showExerciseCreation = false;

  @property({ type: Array })
  exercises: any[] = [
    {
      description: "Test",
      exerciseType: "Test",
      editorStates: {
        doc: "Test",
        extensions: [mySetup, javascript(), autocompletion()]
      }
    }
  ];

  @property({ type: Array })
  exerciseTypes = [
    "Fill The Blanks",
    "Code Skeleton",
    "Buggy Code",
    "Code From Scratch",
    "Code Baseline",
    "Find The Bug",
    "Compiling Error",
    "Code Interpretation",
    "Keyword Use",
  ];

  @property()
  exerciseDescription = "";

  @property({ type: String })
  exerciseLanguage = "Javascript";

  @property({ type: String })
  exerciseType = "Fill The Blanks";

  @property({ type: EditorView })
  codeMirror: EditorView;

  @property()
  autocompletionEnabled = true;

  language = new Compartment();
  autocompletion = new Compartment();
  disabledLines = new Compartment();


  static get scopedElements() {
    return {
      "sl-input": SlInput,
      "sl-checkbox": SlCheckbox,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-button": SlButton,
      "sl-divider": SlDivider,
    };
  }


  render() {
    return html`
      ${this.editable ? html`
        <div class="Wrapper">
          ${this.exerciseCreationTemplate()}
        </div>` : html``} 
        <div id="codeWrapper"></div>`;
  }

  firstUpdated() {
    this.codeMirror = this.createCodeMirror(this.shadowRoot?.getElementById('code'));
    this.codeMirror.focus();
  }

  exerciseCreationTemplate() {
    return html`
    <div class="createExercise">
      <div class="exerciseChoice">
        ${this.exerciseTypeTemplate()}
        ${this.exerciseLanguageTemplate()}
      </div>
      ${this.editorFeatureTemplate()}
      <div id="code"></div>
      </div>`;
  };

  exerciseTypeTemplate() {
    return html`
        <sl-dropdown label="exerciseType">
          <sl-button slot="trigger" caret>${this.exerciseType}</sl-button>
          <sl-menu>
            ${this.exerciseTypes.map((exerciseType) => html`
              <sl-menu-item @click=${(e: any) => { this.switchExerciseCodeMirror(exerciseType); }}>
                ${exerciseType}
              </sl-menu-item>`)}   
          </sl-menu>
        </sl-dropdown>`;
  }

  exerciseLanguageTemplate() {
    return html`
      <sl-dropdown label="Language">
        <sl-button slot="trigger" caret>${this.exerciseLanguage}</sl-button>
        <sl-menu>
          <sl-menu-item @click=${() => this.changeCodeMirrorLanguage("Javascript")}>Javascript</sl-menu-item>
          <sl-menu-item @click=${() => this.changeCodeMirrorLanguage("Python")} >Python</sl-menu-item>
        </sl-menu>
      </sl-dropdown>`;
  }

  editorFeatureTemplate() {
    return html`
      <sl-divider></sl-divider>
      <div class="editorFeature">
      <sl-button
        @click=${() => { }}>Disable editing</sl-button>
      <sl-checkbox checked @change=${() => { this.disableAutocomplete() }}>Autocompletion</sl-checkbox>
      </div>
    `;
  }

  /*   private disableLine() {
      this.disabledLines.push({ from: this.codeMirror.state.selection.main.from, to: this.codeMirror.state.selection.main.to });
    } */

  private changeCodeMirrorLanguage(lang: String) {
    if (lang === "Javascript") {
      this.exerciseLanguage = "Javascript";
      this.codeMirror.dispatch({ effects: this.language.reconfigure(javascript()) });
    } else {
      this.exerciseLanguage = "Python";
      this.codeMirror.dispatch({ effects: this.language.reconfigure(python()) });
    }
    this.codeMirror.focus();
  }

  private disableAutocomplete() {
    this.autocompletionEnabled = !this.autocompletionEnabled;
    if (this.autocompletionEnabled) {
      this.codeMirror.dispatch({ effects: this.autocompletion.reconfigure(autocompletion()) });
    } else {
      this.codeMirror.dispatch({ effects: this.autocompletion.reconfigure([]) });
    }
    this.codeMirror.focus();
  }

  private switchExerciseCodeMirror(exerciseType: string) {
    this.exerciseType = exerciseType;
    this.codeMirror.dispatch({ changes: { from: 0, to: this.codeMirror.state.doc.length, insert: this.exerciseType } })
    this.codeMirror.focus();
  }


  /*   getReadOnlyRanges = (targetState: EditorState): Array<{ from: number | undefined, to: number | undefined }> => {
      return this.disabledLines;
    } */

  private switchToExercise(exercise: number) {
    this.editable = false;
    this.shadowRoot?.getElementById('codeWrapper')?.append(this.codeMirror.dom);
    this.codeMirror.focus();
  }

  private createCodeMirror(parentObject: any) {
    return new EditorView({
      state: EditorState.create({
        doc: ``,
        extensions: [mySetup, this.language.of(javascript()), this.autocompletion.of(autocompletion())]
      }),
      parent: parentObject,
    })
  }
}