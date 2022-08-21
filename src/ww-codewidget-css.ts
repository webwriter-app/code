import { css } from "lit"
export const style = css`
div {
 display: none;
}

:host([editable]) .box{
  display: flex;
  flex-direction: column;
  align-items: left;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: #ddd;
  background-color: #fafafa;
  margin: 10px;
  padding: 10px;
}

.list{
  display: flex;
  flex-direction: row;
  align-items: left;
}

h1 {
  font-size: 1em;
  font-weight: bold;
  font-family: "Roboto Mono", monospace;
}

button {
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: #ccc;
  background-color: #fafafa;
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
`;