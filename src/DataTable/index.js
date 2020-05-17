import React, { Component, createRef } from 'react';
import _ from 'lodash';
import sort from 'fast-sort';
import fastFilter from 'fast-filter';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import DataTableHeader from './components/DataTableHeader';
import DataTableFooter from './components/DataTableFooter';
import DataTableRow from './components/DataTableRow';
import DataTableEditor from './components/DataTableEditor';
import DataTableTopPanel from './components/DataTableTopPanel';
import DataTableBottomPanel from './components/DataTableBottomPanel';
import DataTableContextMenu from './components/DataTableContextMenu';
import { getPreparedColumns, filterRow, clearBlinkers } from './helpers/helpers';
import getValidatedRows from './helpers/getValidatedRows';
import { getColumn, getGridNavigationMap, moveVertical, moveHorizontal, getRowId } from './helpers/gridNavigation';
import {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    UP_DIR,
    RIGHT_DIR,
    DOWN_DIR,
    LEFT_DIR,
    COLUMN_HEADER_MENU_TARGET,
    ENTER
} from './constants';

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
        tableLayout: 'fixed',
        borderSpacing: 0
    },
    tableFooterComponent: {
        display: 'table-footer-group'
    },
    tableHead: {
        backgroundColor: '#fafafa',
        color: '#fcfcfc'
    },
    editor: {
        position: 'absolute'
    }
});

const EDITOR_ID = 'editor';
const EDITOR_INPUT_ID = 'editor-input';
const MENU_POSITION_INITIAL_STATE = {
    mouseX: null,
    mouseY: null
};

export class DataTable extends Component {
    constructor(props) {
        super(props);
        const { rowHeight, tableHeight, columns, onEdit } = this.props;
        this.editorRef = createRef();
        this.activeId = createRef();
        this.tableId = createRef();
        const visibilities = columns
            .filter(c => c.headerName)
            .map(({ headerName, field, hidden }) => ({
                headerName,
                field,
                visible: !hidden
            }));
        const order = 'asc';
        const orderBy = null;
        const searchText = null;
        const preparedColumns = getPreparedColumns(columns, visibilities, { editable: !!onEdit });
        this.state = {
            draftValue: null,
            menuPosition: MENU_POSITION_INITIAL_STATE,
            menuTarget: null,
            selected: [],
            searchText,
            order,
            orderBy,
            scroll: {
                top: 0,
                index: 0,
                end: Math.ceil((tableHeight * 2) / rowHeight)
            },
            editor: { active: false, editing: null, tracking: null, position: null, available: false },
            visibilities,
            preparedColumns
        };
        this.tableId.current = uuidv4()
            .toString()
            .replace(/-/g, '');
    }

    componentDidMount() {
        const { rows } = this.props;
        this.handleScroll(rows)({ target: { scrollTop: 0 } });
    }

    componentDidUpdate() {
        logger.debug('DataTable componentDidUpdate');
        const {
            editor: { available }
        } = this.state;
        window.removeEventListener('resize', this.handleResize);
        window.addEventListener('resize', this.handleResize);
        this.assignEditorMouseWheelHandler();

        if (available) {
            this.focusEditor();
        }
        this.applyEditorStyling();
    }

    applyEditorStyling = () => {
        const {
            editor: { active, tracking }
        } = this.state;
        const editorElement = document.getElementById(EDITOR_ID);
        if (!editorElement) {
            return;
        }
        const editorPosition = this.getEditorPosition(tracking);
        const showEditor = !!active && !!editorPosition;
        editorElement.style.backgroundColor = 'red';
        editorElement.style.zIndex = showEditor ? 1 : -1;
        editorElement.style.opacity = showEditor ? 1 : 0;
        if (editorPosition) {
            editorElement.style.top = `${editorPosition.top}px`;
            editorElement.style.left = `${editorPosition.left}px`;
            editorElement.style.height = `${editorPosition.height}px`;
            editorElement.style.width = `${editorPosition.width}px`;
        }
    };

    getFilteredAndSortedRows = rows => {
        const { preparedColumns, searchText, order, orderBy } = this.state;
        const { showFilter } = this.props;

        const filteredItems = fastFilter(rows, r => !showFilter || filterRow(r, preparedColumns, searchText));
        return order === 'asc'
            ? sort(filteredItems).asc(it => it[orderBy])
            : sort(filteredItems).desc(it => it[orderBy]);
    };

    assignEditorMouseWheelHandler = () => {
        if (this.editorRef && this.editorRef.current) {
            this.editorRef.current.addEventListener('wheel', this.handleEditorWheel, { passive: false });
        }
    };

    focusEditor = () => {
        logger.debug('DataTable focusEditor');
        const editorElement = document.getElementById(EDITOR_INPUT_ID);
        if (editorElement) {
            editorElement.focus();
        }
    };

    getEditorPosition = id => {
        const editingElement = document.getElementById(id);
        if (editingElement) {
            const { width, height, top, left } = editingElement.getBoundingClientRect();
            return { width, height, top, left };
        }

        return null;
    };

    positionEditor = id => {
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                active: false,
                tracking: id,
                available: true
            }
        }));
    };

    activateOrDeactivateEditor = (active, id) => {
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                active,
                editing: id
            }
        }));
    };

    activateEditor = id => {
        logger.debug('DataTable activateEditor', id);
        this.activateOrDeactivateEditor(true, id);
    };

    deactivateEditor = () => {
        logger.debug('DataTable deactivateEditor');
        this.activateOrDeactivateEditor(false);
    };

    isIndeterminate = () => {
        const { selected } = this.state;
        const { rows } = this.props;
        return selected.length > 0 && selected.length < rows.length;
    };

    isChecked = () => {
        const { selected } = this.state;
        const { rows } = this.props;
        return selected.length === rows.length;
    };

    getOriginalOrDraft = row => {
        const { draftValue } = this.state;
        if (draftValue && !_.isEmpty(draftValue) && row.id === draftValue.row.id) {
            return {
                ...row,
                [draftValue.column]: draftValue.value
            };
        }
        return row;
    };

    onSetEditorRef = ref => {
        this.editorRef.current = ref;
    };

    handleResize = () => {
        const {
            scroll: { top }
        } = this.state;
        const { rows } = this.props;
        const filteredRows = this.getFilteredAndSortedRows(getValidatedRows(rows));
        this.handleScroll(filteredRows)({ target: { scrollTop: top } });
    };

    handleEditorWheel = event => {
        const tableContainer = document.getElementById(`${this.tableId.current}-tcontainer`);
        tableContainer.scroll(event.deltaX, event.deltaY);
        event.preventDefault();
    };

    handleScroll = rows => ({ target }) => {
        const { rowHeight } = this.props;
        const numberOfRows = rows.length;
        const calculatedTableHeight = numberOfRows * rowHeight;
        const tableBody = document.getElementById(`${this.tableId.current}-tbody`);
        const positionInTable = target.scrollTop;
        const tableHead = document.getElementById(`${this.tableId.current}-thead`);
        const tableHeadHeight = tableHead.getBoundingClientRect().height;
        const tableFooterHeight = document.getElementById(`${this.tableId.current}-tfoot`).getBoundingClientRect()
            .height;
        const tableContainerHeight = document
            .getElementById(`${this.tableId.current}-tcontainer`)
            .getBoundingClientRect().height;

        const visibleTableHeight = tableContainerHeight - tableHeadHeight - tableFooterHeight;

        const topRowIndex = Math.floor(positionInTable / rowHeight);
        const endRowIndex = topRowIndex + visibleTableHeight / rowHeight;
        tableBody.style.height = `${calculatedTableHeight}px`;
        tableBody.style.width = `${tableHead.getBoundingClientRect().width}px`;

        this.setState(prevState => ({
            scroll: {
                ...prevState.scroll,
                index: topRowIndex,
                end: Math.ceil(endRowIndex),
                top: topRowIndex * rowHeight
            },
            editor: {
                ...prevState.editor
            }
        }));
    };

    handleCellDoubleClick = id => {
        logger.debug('DataTable handleCellDoubleClick');
        this.activateEditor(id);
    };

    handleEditorBlur = () => {
        logger.debug('DataTable handleEditorBlur');
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                position: null,
                available: false,
                active: false
            }
        }));
    };

    handleMove = direction => {
        const { rowHeight } = this.props;
        const {
            scroll: { top },
            editor: { tracking }
        } = this.state;
        if (!tracking) {
            throw Error('tracking is null so move operation cannot be completed');
        }
        const tableContainer = document.getElementById(`${this.tableId.current}-tcontainer`);
        switch (direction) {
            case UP: {
                moveVertical(UP_DIR, tracking, this.gridNavigationMap, {
                    activateCell: this.positionEditor,
                    scroll: () => tableContainer.scroll({ top: top - rowHeight })
                });
                break;
            }
            case ENTER:
            case DOWN: {
                moveVertical(DOWN_DIR, tracking, this.gridNavigationMap, {
                    activateCell: this.positionEditor,
                    scroll: () => tableContainer.scroll({ top: top + rowHeight })
                });
                break;
            }
            case LEFT: {
                moveHorizontal(LEFT_DIR, tracking, this.gridNavigationMap, {
                    activateCell: this.positionEditor
                });
                break;
            }
            case RIGHT: {
                moveHorizontal(RIGHT_DIR, tracking, this.gridNavigationMap, {
                    activateCell: this.positionEditor
                });
                break;
            }
            default:
                throw Error(`Unexpected move direction: ${direction}`);
        }
    };

    handleActivateEditor = id => {
        this.activateEditor(id);
    };

    handleDeActivateEditor = () => {
        this.deactivateEditor();
    };

    handleCellChange = (value, row, column, commit = false) => {
        const { onEdit } = this.props;
        if (commit) {
            onEdit(value, row, column);
            this.setState({ draftValue: null });
        } else {
            this.setState({ draftValue: { value, row, column } });
        }
    };

    handleCancel = () => {
        this.setState({ draftValue: null });
        this.handleEditorBlur();
    };

    handleCommit = () => {
        const { onEdit } = this.props;
        const { draftValue } = this.state;
        if (draftValue) {
            const { value, row, column } = draftValue;
            onEdit(value, row, column);
            this.setState({ draftValue: null });
        }
    };

    handleCellMouseDown = event => {
        logger.debug('DataTable handleCellMouseDown');
        if (this.editorRef.current) {
            this.editorRef.current.blur();
        }
        this.positionEditor(event.target.id);
        event.preventDefault();
    };

    handleSearchTextChanged = searchText => {
        this.setState({
            searchText
        });
    };

    handleDelete = () => {
        const { selected } = this.state;
        const { onDelete } = this.props;
        onDelete(selected);
    };

    handleAdd = () => {
        const { onAdd } = this.props;
        const row = {};
        onAdd(row);
    };

    handleColumnVisibilityChanged = visibilities => {
        const { columns, onEdit } = this.props;
        this.setState({
            visibilities,
            preparedColumns: getPreparedColumns(columns, visibilities, { editable: !!onEdit })
        });
    };

    handleMenuClose = () => {
        this.setState({ menuPosition: MENU_POSITION_INITIAL_STATE, menuTarget: null });
    };

    handleContextTableHeader = menuPosition => {
        this.setState({ menuPosition, menuTarget: COLUMN_HEADER_MENU_TARGET });
    };

    handleRequestSort = (event, property) => {
        clearBlinkers();
        const { order, orderBy } = this.state;
        const isDesc = orderBy === property && order === 'desc';
        this.setState({
            order: isDesc ? 'asc' : 'desc',
            orderBy: property
        });
    };

    handleSelectAllClick = () => {
        const { rows } = this.props;
        if (this.isIndeterminate()) {
            this.setState({ selected: [...rows.map(row => row.id)] });
        } else if (this.isChecked()) {
            this.setState({ selected: [] });
        } else {
            this.setState({ selected: [...rows.map(row => row.id)] });
        }
    };

    handleSelectedChanged = (rowId, isSelected) => {
        if (isSelected) {
            this.setState(prevState => ({
                selected: [...prevState.selected, rowId]
            }));
        } else {
            const { selected } = this.state;
            selected.splice(selected.indexOf(rowId), 1);
            this.setState({ selected: [...selected] });
        }
    };

    renderBody = (filteredRows, preparedColumns) => {
        let {
            scroll: { index }
        } = this.state;
        const {
            scroll: { end },
            selected,
            editor: { tracking, active, available }
        } = this.state;
        const { rowHeight } = this.props;
        const items = [];
        const tableElement = document.getElementById(`${this.tableId.current}-table`);
        const tableWidth = tableElement ? tableElement.getBoundingClientRect().width : 0;
        const columnElements = tableElement ? tableElement.querySelectorAll('div.MuiTableCell-head') : [];
        const windowedRows = [];
        const bufferTopIndex = index - 1 > 0 ? index - 1 : null;
        const bufferBottomIndex = end + 1 < filteredRows.length ? end + 1 : null;
        if (bufferTopIndex && filteredRows[bufferTopIndex]) {
            windowedRows.push({ ...filteredRows[bufferTopIndex], visible: false });
        }
        do {
            if (index >= filteredRows.length) {
                index = filteredRows.length;
                break;
            }
            if (filteredRows[index]) {
                windowedRows.push({ ...filteredRows[index], visible: true });
            }
            const row = filteredRows[index];
            const { validations: { errors } = {} } = row || {};
            const { validations: { warnings } = {} } = row || {};
            items.push(
                <DataTableRow
                    tableId={this.tableId.current}
                    tracking={tracking}
                    editing={active ? tracking : null}
                    editorFocused={available}
                    key={row.id}
                    errors={errors}
                    warnings={warnings}
                    columns={preparedColumns}
                    columnElements={columnElements}
                    row={row}
                    rowIndex={index}
                    rowHeight={rowHeight}
                    selected={selected.includes(row.id)}
                    tableWidth={tableWidth}
                    onMouseDown={this.handleCellMouseDown}
                    onCellDoubleClick={this.handleCellDoubleClick}
                    onSelectedChanged={this.handleSelectedChanged}
                />
            );
            index += 1;
        } while (index < end);
        if (bufferBottomIndex && filteredRows[bufferBottomIndex]) {
            windowedRows.push({ ...filteredRows[bufferBottomIndex - 1], visible: false });
        }
        this.gridNavigationMap = getGridNavigationMap(this.tableId.current, windowedRows, preparedColumns);

        return items;
    };

    render() {
        logger.debug('DataTable render');
        const { classes, tableHeight, rowHeight, rows, rules, onAdd, onEdit, onDelete } = this.props;
        const style = { maxHeight: tableHeight, minHeight: '200px', borderRadius: 0 };
        const {
            order,
            orderBy,
            visibilities,
            editor,
            selected,
            menuTarget,
            menuPosition,
            preparedColumns
        } = this.state;
        const { tracking } = editor;
        const { showErrors = false, showFilter = false } = this.props;
        const canAdd = !!onAdd && !!onEdit;
        const canEdit = canAdd;
        const canDelete = !!onDelete && selected.length > 0;
        const shouldCalculateTotals = _.some(preparedColumns, c => c.total);
        const checked = this.isChecked();
        const indeterminate = this.isIndeterminate();
        if (!canEdit) {
            preparedColumns
                .filter(c => c.rich)
                .forEach(c => {
                    // eslint-disable-next-line
                    c.rich.editable = false;
                });
        }
        const rowId = getRowId(tracking);
        const validatedRows = getValidatedRows(rows, rules);
        const row = rowId && validatedRows.find(r => r.id.toString() === rowId.toString());
        const column = tracking && getColumn(tracking, preparedColumns);
        const { field: activeField } = column || {};
        const draftedRow = this.getOriginalOrDraft(row);
        const value = draftedRow && draftedRow[activeField];

        const filteredRows = this.getFilteredAndSortedRows(validatedRows);

        const errorCount = _.sum(
            _.flatMap(validatedRows, row => (row.validations && !_.isEmpty(row.validations.errors) ? 1 : 0))
        );

        return (
            <>
                <div>
                    <DataTableTopPanel
                        showErrors={showErrors}
                        showFilter={showFilter}
                        errorCount={errorCount}
                        onSearchTextChanged={this.handleSearchTextChanged}
                    />
                    <TableContainer
                        id={`${this.tableId.current}-tcontainer`}
                        onScroll={this.handleScroll(filteredRows)}
                        component={Paper}
                        style={style}>
                        <div id={`${this.tableId.current}-table`} className={classes.tableComponent}>
                            <div
                                id={`${this.tableId.current}-thead`}
                                className={clsx(classes.tableHeadComponent, classes.tableHead)}>
                                <DataTableHeader
                                    columns={preparedColumns}
                                    rowHeight={rowHeight}
                                    visibilities={visibilities}
                                    onContextTableHeader={this.handleContextTableHeader}
                                    onRequestSort={this.handleRequestSort}
                                    onSelectAll={this.handleSelectAllClick}
                                    order={order}
                                    orderBy={orderBy}
                                    checked={checked}
                                    indeterminate={indeterminate}
                                    editable={canEdit}
                                />
                            </div>
                            <div
                                id={`${this.tableId.current}-tbody`}
                                className="tbody"
                                style={{
                                    position: 'relative'
                                }}>
                                {this.renderBody(filteredRows, preparedColumns)}
                            </div>
                            <div id={`${this.tableId.current}-tfoot`} className={classes.tableFooterComponent}>
                                {shouldCalculateTotals && (
                                    <DataTableFooter columns={preparedColumns} rowHeight={rowHeight} rows={rows} />
                                )}
                            </div>
                        </div>
                    </TableContainer>
                    <div id={EDITOR_ID} className={classes.editor}>
                        <DataTableEditor
                            id={EDITOR_INPUT_ID}
                            dataId={tracking}
                            value={value}
                            row={row}
                            column={column}
                            onMove={this.handleMove}
                            onBlur={this.handleEditorBlur}
                            onCommit={this.handleCommit}
                            onCancel={this.handleCancel}
                            onCellChange={this.handleCellChange}
                            onActivateEditor={this.handleActivateEditor}
                            onDeactivateEditor={this.handleDeActivateEditor}
                            ref={this.onSetEditorRef}
                        />
                    </div>
                    {canEdit && (
                        <DataTableBottomPanel
                            canAdd={canAdd}
                            onAddRequested={this.handleAdd}
                            onDeleteRequested={this.handleDelete}
                            canDelete={canDelete}
                        />
                    )}
                    <DataTableContextMenu
                        open={!!menuTarget}
                        type={menuTarget}
                        menuPosition={menuPosition}
                        visibilities={visibilities}
                        onVisibilitiesChanged={this.handleColumnVisibilityChanged}
                        onClose={this.handleMenuClose}
                    />
                    {/* {`*****EDITOR STATE***** = ${JSON.stringify({ ...this.state.editor })}`} */}
                </div>
            </>
        );
    }
}

export default withStyles(styles)(DataTable);
