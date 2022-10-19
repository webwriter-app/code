import { css } from "lit"
export const style = css`

.Wrapper {
  z-index: -1;
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
}

.disableButton {
  align-items: center;
  border-style: solid;
  border-width: 1px;
  border-radius: 20px;
}

.codeEditor {
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: #ddd;
}

.chooseExercise {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.createExercise {
  display: flex;
  flex-direction: column;
}

.exerciseList{
  display: flex;
  flex-direction: row;
  align-items: left;
  flex-wrap: wrap;
  width: 80%;
}

.header {
  margin-top: 0;
  font-size: 1em;
  font-weight: bold;
  font-family: "Roboto Mono", monospace;
}

button {
  border-style: solid;
  min-height: 40px;
  border-width: 1px;
  border-radius: 5px;
  border-color: #ccc;
  background-color: #fafafa;
  margin-top: 10px;
  margin-right: 5px;
  margin-left: 0px;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
}

button:hover {
  background-color: #f5f5f5;
}

button:active {
  background-color: #ddd;
}

.exercises{
  display: flex;
  flex-direction: column;
  width: 50%;
}

.newExercise {
  margin-top: 0px;
  width: 45px;
  height: 45px;
}

#autocompletionEnabled {
  background-color: #fafafa;
}

#autocompletionDisabled {
  background-color: #ddd;
}
`;