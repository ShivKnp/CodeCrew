import TextDiffBinding from './TextDiffBinding';

class StringBinding extends TextDiffBinding {
    constructor(compoThis, doc, path, localPresence) {
        super(compoThis, doc, path, localPresence);
        this.cursors = new Map();
    }

    setup = () => {
        this.update(true);
        let state = this.compoThis.state;
        let docData = this.doc.data;
        this.updateInputOutput(state.input, docData.input[0], 'input');
        this.updateInputOutput(state.output, docData.output[0], 'output');
        this.attachDoc();
        this.attachElement();
    };

    attachElement = () => {
        this._inputListener = (newValue, e) => {
            this.onInput(newValue, e);
        };
        this._inoutListener = (before, after, key) => {
            this._insertInOut(before, after, key);
        }
    };

    attachDoc = () => {
        this.doc.on('op', this.onListener);
    };

    onListener = (op, source) => {
        if (source === this) return;
        if (op.length === 0) return;
        if (op.length > 1) {
            throw new Error('Op with multiple components emitted');
        }
        let component = op[0];
        if (component.p[0] === 'output' || component.p[0] === 'input' || component.p[0] === 'lang') {
            this.updateInputOutput(component.ld, component.li, component.p[0]);
        }
        else if (this.isSubpath(this.path, component.p)) {
            this._parseInsertRemoveOp(component, 'si', 'onInsert');
            this._parseInsertRemoveOp(component, 'sd', 'onRemove');
        } else if (this.isSubpath(component.p, this.path)) {
            this._parseParentOp();
        }
    };

    _parseInsertRemoveOp(component, key, onHandler) {
        if (!component[key]) return;
        let rangeOffset = component.rangeOffset;
        let length = component[key].length;
        this[onHandler](rangeOffset, length);
    }

    _parseParentOp = () => {
        this.update();
    };

    _insertInOut = (before, after, key) => {
        let path = [key, 0];
        let op = { p: path, ld: before, li: after };
        this.doc.submitOp(op, { source: this });
    }

    isSubpath = (path, testPath) => {
        for (var i = 0; i < path.length; i++) {
            if (testPath[i] !== path[i]) return false;
        }
        return true;
    }

    updateInputOutput(before, after, key) {
        if (before === after) return;
        this.compoThis.setState({ [key]: after });
    }

    updateCursors(id, range) {
        if (range) {
            this.cursors.set(id, range);
        } else {
            this.cursors.delete(id);
        }

        const decorations = [];
        for (const [cursorId, cursorRange] of this.cursors.entries()) {
            const isPos = cursorRange.startLineNumber === cursorRange.endLineNumber &&
                cursorRange.startColumn === cursorRange.endColumn;
            decorations.push({
                range: new this.compoThis.state.monaco.Range(
                    cursorRange.startLineNumber,
                    cursorRange.startColumn,
                    cursorRange.endLineNumber,
                    cursorRange.endColumn
                ),
                options: {
                    className: isPos ? 'cursor-position' : 'cursor-selection',
                }
            });
        }
        this.decorations = this.compoThis.state.editor.deltaDecorations(this.decorations, decorations);
    }
}

export default StringBinding;