import { css } from "lit"
export const style = css`

.Wrapper {
  display: flex;
  flex-direction: column;
  align-items: top;
  justify-content: space-between;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: #ddd;
  background-color: #fafafa;
  margin-left: 50px;
  margin-right: 50px;
  padding: 10px;
  padding-left: 50px;
  padding-right: 50px;
}

.exerciseChoice {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.dropdown {
  width: 180px;
}

.red_back{
  background-color: red;
}

.editorFeature {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  padding-bottom: 10px;
}

.cm-editor {
  border-radius: 5px;
}
.cm-gutters {
  border-radius: 5px;
}


`;