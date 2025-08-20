import React, { Component } from "react";
import EditorComponent from "../Components/Editor/EditorComponent";
import axios from "axios";
import ReconnectingWebSocket from "reconnecting-websocket";
import shareDB from "sharedb/lib/client";
import StringBinding from "../EditorBinding/StringBinding";
import Loader from "../Components/Loader/Loading";
import { notification } from "antd";

const serverURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8080';
const websocketURL = process.env.REACT_APP_WEB_SOCKET_URL || 'ws://localhost:8080';

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: "",
            input: "",
            output: "",
            lang: "cpp",
            editor: null,
            monaco: null,
            binding: null,
            runCodeDisabled: false,
            isLoading: true,
            theme: 'vs-dark',
            fontSize: 14,
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        axios.post(`${serverURL}/`, { id: id })
            .then(() => {
                const rws = new ReconnectingWebSocket(`${websocketURL}/bar`);
                const connection = new shareDB.Connection(rws);
                const doc = connection.get("examples", id);

                doc.subscribe((err) => {
                    if (err) throw err;
                    const presence = connection.getPresence("examples");
                    presence.subscribe((err) => { if (err) throw err; });
                    
                    let localPresence = presence.create();
                    let binding = new StringBinding(this, doc, ["content"], localPresence);
                    this.setState({ binding, isLoading: false });
                    binding.setup(this);

                    presence.on("receive", (id, range) => {
                        if (binding.updateCursors) {
                            binding.updateCursors(id, range);
                        }
                    });
                });
            })
            .catch((err) => {
                console.error("Error creating document:", err);
                notification.error({ message: "Failed to connect to the session." });
            });
    }
    
    toggleTheme = (newTheme) => { this.setState({ theme: newTheme }); };
    increaseFont = (size) => { this.setState(prevState => ({ fontSize: size || Math.min(prevState.fontSize + 1, 24) })); };
    decreaseFont = (size) => { this.setState(prevState => ({ fontSize: size || Math.max(prevState.fontSize - 1, 10) })); };

    editorDidMount = (editor, monaco) => {
        editor.focus();
        editor.getModel().pushEOL(0);

        editor.onDidChangeCursorSelection((e) => {
            if (this.state.binding && this.state.binding.localPresence) {
                this.state.binding.localPresence.submit(e.selection, (err) => { if (err) throw err; });
            }
        });
        this.setState({ editor, monaco });
    };

    editorOnChange = (newValue, e) => {
        if (this.state.binding) {
            this.state.binding._inputListener(newValue, e);
        }
        this.setState({ code: newValue });
    };

    handleRun = () => {
        this.setState({ runCodeDisabled: true });
        const code = this.state.editor.getValue();
        axios.post(`${serverURL}/code/run`, {
            code: code,
            input: this.state.input,
            id: this.props.match.params.id,
            lang: this.state.lang,
        }).then(response => {
            if (this.state.binding) {
                this.state.binding._inoutListener(this.state.output, response.data, "output");
            }
            this.setState({ output: response.data, runCodeDisabled: false });
        }).catch(err => {
            const errorOutput = err.response ? err.response.data : "An unexpected error occurred.";
            if (this.state.binding) {
                this.state.binding._inoutListener(this.state.output, errorOutput, "output");
            }
            this.setState({ output: errorOutput, runCodeDisabled: false });
        });
    };

    handleInput = (e) => {
        const newValue = e.target.value;
        if (this.state.binding) {
            this.state.binding._inoutListener(this.state.input, newValue, "input");
        }
        this.setState({ input: newValue });
    };

    handleLang = (value) => {
        if (this.state.binding) {
            this.state.binding._inoutListener(this.state.lang, value, "lang");
        }
        this.setState({ lang: value });
        this.state.monaco.editor.setModelLanguage(this.state.editor.getModel(), value);
    };
    
    render() {
        return (
            <React.Fragment>
                {this.state.isLoading && <Loader />}
                <EditorComponent
                    {...this.state}
                    editorDidMount={this.editorDidMount}
                    editorOnChange={this.editorOnChange}
                    handleLang={this.handleLang}
                    handleRun={this.handleRun}
                    handleInput={this.handleInput}
                    toggleTheme={this.toggleTheme}
                    increaseFont={this.increaseFont}
                    decreaseFont={this.decreaseFont}
                />
            </React.Fragment>
        );
    }
}

export default Editor;