import React, { Component, createRef } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import Paper from '@material-ui/core/Paper';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import { Typography } from '@material-ui/core';
import TableContainer from '@material-ui/core/TableContainer';
import DataTableHeader from './components/DataTableHeader';
import DataTableFooter from './components/DataTableFooter';
import DataTableRow from './components/DataTableRow';
import DataTableEditor from './components/DataTableEditor';
import DataTableTopPanel from './components/DataTableTopPanel';
import DataTableBottomPanel from './components/DataTableBottomPanel';
import {
    getPreparedColumns,
    filterRow,
    stableSort,
    getSorting,
    getUpdatedRows,
    clearBlinkers
} from './helpers/helpers';
import getValidatedRows from './helpers/getValidatedRows';
import { isEditable, getColumn, getGridNavigationMap, moveVertical, moveHorizontal } from './helpers/gridNavigation';
import { LEFT, RIGHT, UP, DOWN, ENTER, UP_DIR, RIGHT_DIR, DOWN_DIR, LEFT_DIR, SELECTOR } from './constants';

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
const SELECTED_CLASS_NAME = 'cell-selected';
const EDITOR_INITIAL_STATE = { active: false, editing: null, editingColumn: null };
const MENU_POSITION_INITIAL_STATE = {
    mouseX: null,
    mouseY: null
};

export class DataTable extends Component {
    constructor(props) {
        super(props);
        const { rowHeight, tableHeight, columns } = this.props;
        this.preparedColumns = [];
        this.editorRef = createRef();
        this.activeId = createRef();
        this.tableId = createRef();
        this.tableId.current = uuidv4()
            .toString()
            .replace(/-/g, '');
        this.state = {
            menuPosition: MENU_POSITION_INITIAL_STATE,
            selected: [],
            searchText: null,
            order: 'asc',
            orderBy: null,
            scroll: {
                top: 0,
                index: 0,
                end: Math.ceil((tableHeight * 2) / rowHeight)
            },
            editor: EDITOR_INITIAL_STATE,
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
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            editor: { editing }
        } = prevState;
        this.applyEditorVisibilityAndPositioning(editing);
        window.removeEventListener('resize', this.handleResize);
        window.addEventListener('resize', this.handleResize);
        this.activatePreviousCell();
        this.assignEditorMouseWheelHandler();
    }

    getFilteredAndSortedRows = (rows, preparedColumns) => {
        const { rules, showFilter } = this.props;
        const { searchText, order, orderBy } = this.state;

        return stableSort(
            getValidatedRows(rows, rules).filter(r => !showFilter || filterRow(r, preparedColumns, searchText)),
            preparedColumns,
            getSorting(order, orderBy)
        );
    };

    assignEditorMouseWheelHandler = () => {
        if (this.editorRef && this.editorRef.current) {
            this.editorRef.current.onwheel = this.handleEditorWheel;
        }
    };

    applyEditorVisibilityAndPositioning = previouslyEditing => {
        const { editor } = this.state;
        const editorElement = document.getElementById(EDITOR_ID);
        const editorPosition = this.getEditorPosition();
        const showEditor = !!editor.active && !!editorPosition;
        editorElement.style.zIndex = showEditor ? 1 : -1;
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
        const {
            editor: { editing }
        } = this.state;
        if (this.activeId.current && !editing) {
            const element = document.getElementById(this.activeId.current);
            if (element) {
                element.classList.add(SELECTED_CLASS_NAME);
                // TODO: this line causes issues and needs to be removed as it steals focus
                element.focus();
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
        this.activeId.current = id;
        const element = document.getElementById(id);
        if (element) {
            element.classList.add(SELECTED_CLASS_NAME);
            element.focus();
        }
    };

    deactivateCell = id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove(SELECTED_CLASS_NAME);
            element.blur();
        }
    };

    showEditor = id => {
        const focusedElement = document.getElementById(id);
        if (!focusedElement) {
            console.warn(`element with id: ${id} could not be found`);
            return;
        }
        const { columns } = this.props;
        if (!isEditable(id, columns)) {
            return;
        }
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                editingColumn: getColumn(id, columns),
                active: true,
                editing: [id]
            }
        }));
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

    onSetEditorRef = ref => {
        this.editorRef.current = ref;
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
        const endRowIndex = topRowIndex + visibleTableHeight / rowHeight;
        tableBody.style.height = `${calculatedTableHeight}px`;

        this.setState(prevState => ({
            scroll: {
                ...prevState.scroll,
                index: topRowIndex,
                end: Math.ceil(endRowIndex),
                top: topRowIndex * rowHeight
            }
        }));
    };

    handleCellDoubleClick = id => this.showEditor(id);

    handleCellKeyDown = (event, id) => {
        if (event.ctrlKey || event.shiftKey) {
            return;
        }
        const { rowHeight } = this.props;
        const {
            scroll: { top }
        } = this.state;
        const tableContainer = document.getElementById(`${this.tableId.current}-tcontainer`);
        switch (event.keyCode) {
            case UP:
                moveVertical(UP_DIR, this.activeId.current, this.gridNavigationMap, {
                    activateCell: this.activateCell,
                    scroll: () => tableContainer.scroll({ top: top - rowHeight })
                });
                break;
            case RIGHT:
                moveHorizontal(RIGHT_DIR, this.activeId.current, this.gridNavigationMap, {
                    activateCell: this.activateCell
                });
                break;
            case DOWN:
                moveVertical(DOWN_DIR, this.activeId.current, this.gridNavigationMap, {
                    activateCell: this.activateCell,
                    scroll: () => tableContainer.scroll({ top: top + rowHeight })
                });
                event.preventDefault();
                break;
            case LEFT:
                moveHorizontal(LEFT_DIR, this.activeId.current, this.gridNavigationMap, {
                    activateCell: this.activateCell
                });
                break;
            default: {
                this.showEditor(id);
            }
        }
        event.preventDefault();
    };

    handleEditorBlur = () => {
        this.setState(prevState => ({
            editor: {
                ...prevState.editor,
                ...EDITOR_INITIAL_STATE
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

    handleCellBlur = event => this.deactivateCell(event.target.id);

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
        this.setState({
            visibilities
        });
    };

    handleMenuClose = () => {
        // console.log('close');
        // this.setState({ menuPosition: MENU_POSITION_INITIAL_STATE });
    };

    handleContextTableHeader = menuPosition => {
        this.setState({ menuPosition });
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

    handleCheckedChange = column => event => {
        const { visibilities } = this.props;
        const updated = getUpdatedRows(
            !column.visible,
            column,
            'visible',
            visibilities,
            (r1, r2) => r1.headerName === r2.headerName
        );
        const nothingChecked = updated.filter(v => v.visible).length === 0;
        if (!nothingChecked) {
            this.setState({
                visibilities: updated
            });
        }
        event.stopPropagation();
    };

    renderMenuItems = () => {
        const { visibilities } = this.state;
        return visibilities.map(column => (
            <MenuItem key={column.field} onClick={this.handleCheckedChange(column)}>
                <Checkbox checked={column.visible} />
                <Typography>{column.headerName}</Typography>
            </MenuItem>
        ));
    };

    renderBody = (filteredRows, preparedColumns) => {
        let {
            scroll: { index }
        } = this.state;
        const {
            scroll: { end }
        } = this.state;
        const { rowHeight, onAdd, onEdit } = this.props;
        const items = [];
        const tableElement = document.getElementById(`${this.tableId.current}-table`);
        const tableWidth = tableElement ? tableElement.getBoundingClientRect().width : 0;
        const columnElements = tableElement ? tableElement.querySelectorAll('div.MuiTableCell-head') : [];
        const windowedRows = [];
        const invisibleOutOfBoundsTopRow = index - 1 > 0 ? index - 1 : null;
        const invisibleOutOfBoundsBottomRow = end + 1 < filteredRows.length ? end + 1 : null;
        if (invisibleOutOfBoundsTopRow) {
            windowedRows.push({ ...filteredRows[invisibleOutOfBoundsTopRow], visible: false });
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
            items.push(
                <DataTableRow
                    tableId={this.tableId.current}
                    key={row.id}
                    columns={preparedColumns}
                    columnElements={columnElements}
                    row={row}
                    rowIndex={index}
                    rowHeight={rowHeight}
                    tableWidth={tableWidth}
                    onMouseDown={this.handleCellMouseDown}
                    onBlur={this.handleCellBlur}
                    onCellDoubleClick={this.handleCellDoubleClick}
                    onCellKeyDown={this.handleCellKeyDown}
                />
            );
            index += 1;
        } while (index < end);
        if (invisibleOutOfBoundsBottomRow) {
            windowedRows.push({ ...filteredRows[invisibleOutOfBoundsBottomRow - 1], visible: false });
        }
        this.gridNavigationMap = getGridNavigationMap(this.tableId.current, windowedRows, preparedColumns);

        return items;
    };

    render() {
        const { classes, tableHeight, rowHeight, columns, rows, onAdd, onEdit, onDelete } = this.props;
        const style = { maxHeight: tableHeight, minHeight: '200px', borderRadius: 0 };
        const {
            order,
            orderBy,
            visibilities,
            editor,
            selected,
            menuPosition: { mouseY, mouseX }
        } = this.state;
        const { editingColumn } = editor;
        const preparedColumns = getPreparedColumns(columns, visibilities);
        const filteredRows = this.getFilteredAndSortedRows(rows, preparedColumns);
        const { showErrors = false, showFilter = false } = this.props;
        const canAdd = !!onAdd && !!onEdit;
        const canEdit = canAdd;
        const canDelete = !!onDelete && selected.length > 0;
        if (canEdit) {
            // push a check column into the mix
            preparedColumns.unshift({
                field: SELECTOR
            });
        }
        const shouldCalculateTotals = _.some(preparedColumns, c => c.total);
        const checked = this.isChecked();
        const indeterminate = this.isIndeterminate();

        const edtiorContainerStyle = {
            zIndex: editor.active ? 1 : -1,
            opacity: editor.active ? 1 : 0,
            ...this.getEditorPosition()
        };

        const errorCount = _.sum(
            _.flatMap(rows, row => (row.validations && !_.isEmpty(row.validations.errors) ? 1 : 0))
        );

        return (
            <>
                <div>
                    {/* {JSON.stringify(scroll)} */}
                    <DataTableTopPanel
                        showErrors={showErrors}
                        showFilter={showFilter}
                        errorCount={errorCount}
                        onSearchTextChanged={this.handleSearchTextChanged}
                    />
                    <TableContainer
                        id={`${this.tableId.current}-tcontainer`}
                        onScroll={this.handleScroll}
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
                                    onSelectAll={this.handleSelectAll}
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
                    {canEdit && (
                        <DataTableBottomPanel
                            canAdd={canAdd}
                            onAddRequested={this.handleAdd}
                            onDeleteRequested={this.handleDelete}
                            canDelete={canDelete}
                        />
                    )}
                    <div id={EDITOR_ID} className={classes.editor} style={edtiorContainerStyle}>
                        <DataTableEditor
                            id={EDITOR_INPUT_ID}
                            column={editingColumn}
                            onBlur={this.handleEditorBlur}
                            ref={this.onSetEditorRef}
                        />
                    </div>
                    <ClickAwayListener onClickAway={this.handleMenuClose}>
                        <Menu
                            keepMounted
                            open={!!mouseY}
                            anchorReference="anchorPosition"
                            anchorPosition={
                                mouseY !== null && mouseX !== null ? { top: mouseY, left: mouseX } : undefined
                            }>
                            <MenuItem>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Columns
                                </Box>
                            </MenuItem>
                            <Divider />
                            {this.renderMenuItems()}
                        </Menu>
                    </ClickAwayListener>
                </div>
            </>
        );
    }
}

export default withStyles(styles)(DataTable);
