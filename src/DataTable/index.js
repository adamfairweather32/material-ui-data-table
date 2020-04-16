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
    }
});

const DataTable = ({ classes, rows, columns, rowHeight, tableHeight, onAdd, onEdit, onDelete }) => {
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
        editor: { active: false },
        visibilities: columns
            .filter(c => c.headerName)
            .map(({ headerName, field, hidden }) => ({
                headerName,
                field,
                visible: !hidden
            }))
    });

    const preparedColumns = getPreparedColumns(columns, state.visibilities);

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
        const { width, height, top, left } = focusedElement.getBoundingClientRect();
        setState({
            ...state,
            editor: {
                ...state.editor,
                type: 'autocomplete',
                active: true,
                position: {
                    width,
                    height,
                    top,
                    left
                }
            }
        });
        focusedElement.parentElement.style.setProperty('opacity', 0);
        const editor = document.getElementById('editor');
        editor.setAttribute('editing-id', id);
        editor.focus();
    };

    const handleCellDoubleClick = id => {
        showEditor(id);
    };

    const handleCellKeyDown = id => {
        showEditor(id);
    };

    const handleEditorBlur = () => {
        setState({
            ...state,
            editor: {
                ...state.editor,
                active: false
            }
        });
        const editor = document.getElementById('editor');
        const id = editor.getAttribute('editing-id');
        const overlayedElement = document.getElementById(id);
        if (overlayedElement) {
            overlayedElement.parentElement.style.setProperty('opacity', 1);
        } else {
            console.warn(`element with id ${id} that was under editing no longer exists`);
        }
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
    return (
        <>
            <div>
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
                <div>
                    <StyledOutlinedInput
                        style={{
                            zIndex: state.editor.active ? 100 : -1,
                            opacity: state.editor.active ? 1 : 0,
                            position: 'absolute',
                            ...state.editor.position
                        }}
                        id="editor"
                        onBlur={handleEditorBlur}
                        variant="outlined"
                    />
                </div>
            </div>
        </>
    );
};

export default withStyles(styles)(DataTable);
