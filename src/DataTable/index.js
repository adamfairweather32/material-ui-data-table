import React, { useState, useEffect, useRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { MemoizedDataTableHeader } from './components/DataTableHeader';
import { MemoizedDataTableFooter } from './components/DataTableFooter';
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

let timer = null;

const FOCUS_TIMEOUT_MS = 10;
const EDITOR_ID = 'editor';
const EDITING_ID_ATTRIBUTE = 'editing-id';
const SELECTED_CLASS_NAME = 'cell-selected';
const AUTOCOMPLETE_TYPE = 'autocomplete';

const DataTable = ({ classes, rows, columns, rowHeight, tableHeight, onAdd, onEdit, onDelete }) => {
    const activeId = useRef(null);
    const tableId = useRef(
        uuidv4()
            .toString()
            .replace(/-/g, '')
    );

    const [state, setState] = useState({
        tableHeight: rowHeight * rows.length,
        scroll: {
            top: 0,
            index: 0,
            end: Math.ceil((tableHeight * 2) / rowHeight)
        },
        editor: { active: false, position: {} },
        visibilities: columns
            .filter(c => c.headerName)
            .map(({ headerName, field, hidden }) => ({
                headerName,
                field,
                visible: !hidden
            }))
    });

    const preparedColumns = getPreparedColumns(columns, state.visibilities);

    const activatePreviousCell = () => {
        if (activeId.current) {
            const element = document.getElementById(activeId.current);
            if (element) {
                element.classList.add(SELECTED_CLASS_NAME);
            }
        }
    };

    const onScroll = ({ target }) => {
        const numberOfRows = rows.length;
        const calculatedTableHeight = numberOfRows * rowHeight;
        const tableBody = document.getElementById(`${tableId.current}-tbody`);
        const positionInTable = target.scrollTop;

        const tableHeadHeight = document.getElementById(`${tableId.current}-thead`).getBoundingClientRect().height;
        const tableFooterHeight = document.getElementById(`${tableId.current}-tfoot`).getBoundingClientRect().height;
        const tableContainerHeight = document.getElementById(`${tableId.current}-tcontainer`).getBoundingClientRect()
            .height;

        const visibleTableHeight = tableContainerHeight - tableHeadHeight - tableFooterHeight;

        const topRowIndex = Math.floor(positionInTable / rowHeight);
        const endRow = topRowIndex + visibleTableHeight / rowHeight;
        tableBody.style.height = `${calculatedTableHeight}px`;

        setState({
            ...state,
            scroll: {
                ...state.scroll,
                index: topRowIndex,
                end: Math.ceil(endRow),
                top: topRowIndex * rowHeight
            }
        });
        clearTimeout(timer);
        timer = setTimeout(() => activatePreviousCell(), FOCUS_TIMEOUT_MS);
    };

    useEffect(() => {
        onScroll({ target: { scrollTop: 0 } });
        // eslint-disable-next-line
    }, []);

    function handleWindowResize() {
        onScroll({ target: { scrollTop: 0 } });
    }

    window.onresize = handleWindowResize;

    const showEditor = id => {
        const focusedElement = document.getElementById(id);
        if (!focusedElement) {
            console.warn(`element with id: ${id} could not be found`);
            return;
        }
        setState({
            ...state,
            editor: {
                ...state.editor,
                type: AUTOCOMPLETE_TYPE,
                active: true,
                editing: id
            }
        });
        focusedElement.parentElement.style.setProperty('opacity', 0);
        const editor = document.getElementById(EDITOR_ID);
        editor.setAttribute(EDITING_ID_ATTRIBUTE, id);
        editor.focus();
    };

    const handleCellDoubleClick = id => {
        showEditor(id);
    };

    const handleCellKeyDown = id => {
        showEditor(id);
    };

    const handleEditorBlur = () => {
        console.log('blur editor');
        setState({
            ...state,
            editor: {
                ...state.editor,
                active: false,
                editing: null
            }
        });
        const editor = document.getElementById(EDITOR_ID);
        const id = editor.getAttribute(EDITING_ID_ATTRIBUTE);
        const overlayedElement = document.getElementById(id);
        if (overlayedElement) {
            overlayedElement.parentElement.style.setProperty('opacity', 1);
        } else {
            console.warn(`element with id ${id} that was under editing no longer exists`);
        }
    };

    const handleMouseDown = event => {
        if (activeId.current) {
            const previousElement = document.getElementById(activeId.current);
            if (previousElement) {
                previousElement.classList.remove(SELECTED_CLASS_NAME);
            }
        }
        const element = document.getElementById(event.target.id);
        if (element) {
            activeId.current = event.target.id;

            element.classList.add(SELECTED_CLASS_NAME);
            element.focus();
        }
        event.preventDefault();
    };

    const handleBlur = event => {
        const element = document.getElementById(event.target.id);
        if (element) {
            element.classList.remove(SELECTED_CLASS_NAME);
        }
    };

    const getEditorPosition = () => {
        const {
            editor: { editing }
        } = state;
        const { position } = state.editor;
        if (editing) {
            const editingElement = document.getElementById(editing);
            if (editingElement) {
                const { width, height, top, left } = editingElement.getBoundingClientRect();
                return { width, height, top, left };
            }
        }
        return position;
    };

    const renderBody = () => {
        let {
            scroll: { index }
        } = state;
        const items = [];
        const tableElement = document.getElementById(`${tableId.current}-table`);
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
                        tableId={tableId.current}
                        columns={preparedColumns}
                        columnElements={columnElements}
                        row={rows[index]}
                        onMouseDown={handleMouseDown}
                        onBlur={handleBlur}
                        onCellDoubleClick={handleCellDoubleClick}
                        onCellKeyDown={handleCellKeyDown}
                    />
                </div>
            );
            index += 1;
        } while (index < state.scroll.end);

        return items;
    };

    const style = { maxHeight: tableHeight, minHeight: '200px', borderRadius: 0 };

    const editorStyle = {
        zIndex: state.editor.active ? 100 : -1,
        opacity: state.editor.active ? 1 : 0,
        ...getEditorPosition()
    };

    return (
        <>
            <div>
                {JSON.stringify(state.scroll)}
                <div>
                    <StyledOutlinedInput
                        className={classes.autoCompleteEditor}
                        style={editorStyle}
                        id={EDITOR_ID}
                        onBlur={handleEditorBlur}
                        variant="outlined"
                    />
                </div>
                <TableContainer
                    id={`${tableId.current}-tcontainer`}
                    onScroll={onScroll}
                    component={Paper}
                    style={style}>
                    <div id={`${tableId.current}-table`} className={classes.tableComponent}>
                        <div
                            id={`${tableId.current}-thead`}
                            className={clsx(classes.tableHeadComponent, classes.tableHead)}>
                            <MemoizedDataTableHeader columns={preparedColumns} rowHeight={rowHeight} />
                        </div>
                        <div
                            id={`${tableId.current}-tbody`}
                            className="tbody"
                            style={{
                                position: 'relative'
                            }}>
                            {renderBody()}
                        </div>
                        <div id={`${tableId.current}-tfoot`} className={classes.tableFooterComponent}>
                            <MemoizedDataTableFooter columns={preparedColumns} rowHeight={rowHeight} rows={rows} />
                        </div>
                    </div>
                </TableContainer>
            </div>
        </>
    );
};

export default withStyles(styles)(DataTable);
