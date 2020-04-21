import React, { Component, createRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import DataTableHeader from './components/DataTableHeader';
import DataTableFooter from './components/DataTableFooter';
import DataTableRow from './components/DataTableRow';
import StyledOutlinedInput from './styled/StyledOutlinedInput';
import { getPreparedColumns } from './helpers/helpers';

const styles = () => ({
    tableHeadComponent: {
        width: '100%',
        display: 'table-header-group',
        borderSpacing: 0,
        borderCollapse: 'collapse'
    },
    tableComponent: {
        width: '100%',
        display: 'table',
        borderSpacing: 0
    },
    tableFooterComponent: {
        display: 'table-footer-group'
    },
    tableHead: {
        backgroundColor: '#fafafa',
        color: '#fcfcfc'
    },
    tableCell: {
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem'
    },
    tableRow: {
        display: 'table-row'
    },
    tableRowOdd: {
        backgroundColor: '#EBEAF6'
    },
    tableRowEven: {
        backgroundColor: '#fcfcfc'
    },
    autoCompleteEditor: {
        position: 'absolute'
    }
});

const timer = null;

const FOCUS_TIMEOUT_MS = 10;
const EDITOR_ID = 'editor';
const EDITOR_INPUT_ID = 'editor-input';
const SELECTED_CLASS_NAME = 'cell-selected';
const AUTOCOMPLETE_TYPE = 'autocomplete';

export class DataTable extends Component {
    constructor(props) {
        super(props);
        const { rowHeight, tableHeight, columns } = this.props;
        this.editorRef = createRef();
        this.activeId = createRef();
        this.tableId = createRef();
        this.tableId.current = uuidv4()
            .toString()
            .replace(/-/g, '');
        this.state = {
            scroll: {
                top: 0,
                index: 0,
                end: Math.ceil((tableHeight * 2) / rowHeight)
            },
            editor: { active: false },
            visibilities: columns
                .filter(c => c.headerName)
                .map(({ headerName, field, hidden }) => ({
                    headerName,
                    field,
                    visible: !hidden
                }))
        };
    }

    componentDidMount() {
        this.handleScroll({ target: { scrollTop: 0 } });
        this.editorRef.current.onwheel = this.handleEditorWheel;
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            editor: { editing }
        } = prevState;
        this.applyEditorVisibilityAndPositioning(editing);
        window.removeEventListener('resize', this.handleResize);
        window.addEventListener('resize', this.handleResize);
    }

    applyEditorVisibilityAndPositioning = previouslyEditing => {
        const { editor } = this.state;
        const editorElement = document.getElementById(EDITOR_ID);
        const editorPosition = this.getEditorPosition();
        const showEditor = !!editor.active && !!editorPosition;
        editorElement.style.zIndex = showEditor ? 100 : -100;
        editorElement.style.opacity = showEditor ? 1 : 0;
        if (editorPosition) {
            editorElement.style.top = `${editorPosition.top}px`;
            editorElement.style.left = `${editorPosition.left}px`;
            editorElement.style.height = `${editorPosition.height}px`;
            editorElement.style.width = `${editorPosition.width}px`;
        }
        if (editor.active) {
            this.overlayEditorAndHideOverlayedElement();
        } else {
            this.restoreOverlayedElementByEditor(previouslyEditing);
        }
    };

    getEditorPosition = () => {
        const {
            editor: { editing }
        } = this.state;
        if (editing && editing.length === 1) {
            const editingElement = document.getElementById(editing[0]);
            if (editingElement) {
                const { width, height, top, left } = editingElement.getBoundingClientRect();
                return { width, height, top, left };
            }
        }
        return null;
    };

    activatePreviousCell = () => {
        if (this.activeId.current) {
            const element = document.getElementById(this.activeId.current);
            if (element) {
                element.classList.add(SELECTED_CLASS_NAME);
            }
        }
    };

    restoreOverlayedElement = id => {
        const activeCell = document.getElementById(id);
        if (activeCell) {
            activeCell.parentElement.style.setProperty('opacity', 1);
        }
    };

    restoreOverlayedElementByEditor = previouslyEditing => {
        if (previouslyEditing) {
            previouslyEditing.forEach(this.restoreOverlayedElement);
        }
    };

    overlayElement = id => {
        const activeCell = document.getElementById(id);
        if (activeCell) {
            activeCell.parentElement.style.setProperty('opacity', 0);
        }
    };

    overlayEditorAndHideOverlayedElement = () => {
        const {
            editor: { editing }
        } = this.state;
        if (editing) {
            editing.forEach(this.overlayElement);
            const editorInput = document.getElementById(EDITOR_INPUT_ID);
            editorInput.focus();
        }
    };

    activateCell = id => {
        const element = document.getElementById(id);
        if (element) {
            this.activeId.current = id;
            element.classList.add(SELECTED_CLASS_NAME);
            element.focus();
        }
    };

    deactivateCell = id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove(SELECTED_CLASS_NAME);
        }
    };

    showEditor = id => {
        const focusedElement = document.getElementById(id);
        if (!focusedElement) {
            console.warn(`element with id: ${id} could not be found`);
            return;
        }
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                type: AUTOCOMPLETE_TYPE,
                active: true,
                editing: [id]
            }
        }));
    };

    handleResize = () => {
        const {
            scroll: { top }
        } = this.state;
        this.handleScroll({ target: { scrollTop: top } });
    };

    handleEditorWheel = event => {
        const tableContainer = document.getElementById(`${this.tableId.current}-tcontainer`);
        tableContainer.scroll(event.deltaX, event.deltaY);
        event.preventDefault();
    };

    handleScroll = ({ target }) => {
        const { rows, rowHeight } = this.props;
        const numberOfRows = rows.length;
        const calculatedTableHeight = numberOfRows * rowHeight;
        const tableBody = document.getElementById(`${this.tableId.current}-tbody`);
        const positionInTable = target.scrollTop;

        const tableHeadHeight = document.getElementById(`${this.tableId.current}-thead`).getBoundingClientRect().height;
        const tableFooterHeight = document.getElementById(`${this.tableId.current}-tfoot`).getBoundingClientRect()
            .height;
        const tableContainerHeight = document
            .getElementById(`${this.tableId.current}-tcontainer`)
            .getBoundingClientRect().height;

        const visibleTableHeight = tableContainerHeight - tableHeadHeight - tableFooterHeight;

        const topRowIndex = Math.floor(positionInTable / rowHeight);
        const endRow = topRowIndex + visibleTableHeight / rowHeight;
        tableBody.style.height = `${calculatedTableHeight}px`;

        this.setState(prevState => ({
            scroll: {
                ...prevState.scroll,
                index: topRowIndex,
                end: Math.ceil(endRow),
                top: topRowIndex * rowHeight
            }
        }));
        clearTimeout(timer);
        this.timer = setTimeout(() => this.activatePreviousCell(), FOCUS_TIMEOUT_MS);
    };

    handleCellDoubleClick = id => {
        this.showEditor(id);
    };

    handleCellKeyDown = id => {
        this.showEditor(id);
    };

    handleEditorBlur = () => {
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                active: false,
                editing: null
            }
        }));
    };

    handleCellMouseDown = event => {
        if (this.activeId.current) {
            const previousElement = document.getElementById(this.activeId.current);
            if (previousElement) {
                previousElement.classList.remove(SELECTED_CLASS_NAME);
            }
        }
        this.activateCell(event.target.id);
        event.preventDefault();
    };

    handleCellBlur = event => {
        this.deactivateCell(event.target.id);
    };

    renderBody = () => {
        let {
            scroll: { index }
        } = this.state;
        const {
            scroll: { end }
        } = this.state;
        const { visibilities } = this.state;
        const { classes, rowHeight, rows, columns } = this.props;
        const preparedColumns = getPreparedColumns(columns, visibilities);
        const items = [];
        const tableElement = document.getElementById(`${this.tableId.current}-table`);
        const tableWidth = tableElement ? tableElement.getBoundingClientRect().width : 0;
        const columnElements = tableElement ? tableElement.querySelectorAll('div.MuiTableCell-head') : [];
        do {
            if (index >= rows.length) {
                index = rows.length;
                break;
            }
            const style = {
                top: index * rowHeight,
                height: rowHeight,
                lineHeight: `${rowHeight}px`,
                width: tableWidth,
                position: 'absolute'
            };
            items.push(
                <div
                    style={style}
                    className={clsx(classes.tableRow, index % 2 === 0 ? classes.tableRowOdd : classes.tableRowEven)}
                    key={index}>
                    <DataTableRow
                        tableId={this.tableId.current}
                        columns={preparedColumns}
                        columnElements={columnElements}
                        row={rows[index]}
                        onMouseDown={this.handleCellMouseDown}
                        onBlur={this.handleCellBlur}
                        onCellDoubleClick={this.handleCellDoubleClick}
                        onCellKeyDown={this.handleCellKeyDown}
                    />
                </div>
            );
            index += 1;
        } while (index < end);

        return items;
    };

    render() {
        const { classes, tableHeight, rowHeight, columns, rows } = this.props;
        const style = { maxHeight: tableHeight, minHeight: '200px', borderRadius: 0 };
        const { visibilities, scroll, editor } = this.state;
        const preparedColumns = getPreparedColumns(columns, visibilities);

        const editorStyle = {
            zIndex: editor.active ? 100 : -1,
            opacity: editor.active ? 1 : 0,
            ...this.getEditorPosition()
        };
        return (
            <>
                <div>
                    {JSON.stringify(scroll)}
                    {JSON.stringify(editor)}
                    <TableContainer
                        id={`${this.tableId.current}-tcontainer`}
                        onScroll={this.handleScroll}
                        component={Paper}
                        style={style}>
                        <div id={`${this.tableId.current}-table`} className={classes.tableComponent}>
                            <div
                                id={`${this.tableId.current}-thead`}
                                className={clsx(classes.tableHeadComponent, classes.tableHead)}>
                                <DataTableHeader columns={preparedColumns} rowHeight={rowHeight} />
                            </div>
                            <div
                                id={`${this.tableId.current}-tbody`}
                                className="tbody"
                                style={{
                                    position: 'relative'
                                }}>
                                {this.renderBody()}
                            </div>
                            <div id={`${this.tableId.current}-tfoot`} className={classes.tableFooterComponent}>
                                <DataTableFooter columns={preparedColumns} rowHeight={rowHeight} rows={rows} />
                            </div>
                        </div>
                    </TableContainer>
                    <div id={EDITOR_ID} className={classes.autoCompleteEditor} style={editorStyle}>
                        <StyledOutlinedInput
                            id={EDITOR_INPUT_ID}
                            onBlur={this.handleEditorBlur}
                            variant="outlined"
                            inputRef={ref => {
                                this.editorRef.current = ref;
                            }}
                        />
                    </div>
                </div>
            </>
        );
    }
}

export default withStyles(styles)(DataTable);
