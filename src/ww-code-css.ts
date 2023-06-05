import { css } from 'lit';
export const style = css`
    .Wrapper {
        display: flex;
        flex-direction: column;
        font-family: monospace;
        align-items: top;
        justify-content: space-between;
        min-width: 400px;
    }

    .codeExecutionWrapper {
        display: flex;
        flex-direction: end;
        justify-content: space-between;
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

    .editorFeatures {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        padding-bottom: 10px;
    }

    .cardBody {
        display: flex;
        flex-direction: column;
        align-items: left;
        justify-content: center;
        padding-right: 10px;
    }

    .cardElements {
        display: flex;
        flex-direction: row;
    }

    .card {
        --padding: 10px;
        align-items: center;
        justify-content: center;
    }

    .card [slot='footer'] {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 720px) {
        .editorFeatures {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
        }

        .exerciseChoice {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
        }

        .dropdown {
            padding: 10px;
        }

        .Wrapper {
            margin-left: 5px;
            margin-right: 5px;
            padding-left: 10px;
            padding-right: 10px;
        }
    }

    .codeViewHeader {
        height: 50px;
        /* background-color: red; */
    }
`;
