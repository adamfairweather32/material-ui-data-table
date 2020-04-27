import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import clsx from 'clsx';
import { getUpdatedRows } from '../helpers/helpers';

const styles = () => ({
    tableCell: {
        letterSpacing: '0',
        fontSize: '1rem',
        width: '6rem'
    },
    tableCellHead: {
        fontSize: '1rem',
        fontWeight: 'bold',
        verticalAlign: 'middle',
        position: 'sticky',
        zIndex: 4,
        backgroundColor: '#fcfcfc',
        color: 'black',
        top: 0,
        '&:last-child': {
            paddingRight: '4px'
        }
    },
    tableCellHeadDiv: {
        '&:first-child': {
            paddingLeft: '5px',
            paddingRight: '5px',
            borderLeft: '1px solid rgba(224, 224, 224, 1)'
        }
    },
    tableRow: {
        display: 'table-row'
    }
});

const initialState = {
    mouseX: null,
    mouseY: null
};

export class DataTableHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState
        };
    }

    shouldComponentUpdate(nextProps) {
        const { columns } = this.props;
        const { columns: nextColumns } = nextProps;
        return _.isEqual(columns, nextColumns);
    }

    getAlignmentForColumn = column => {
        const {
            rich: { numeric = false }
        } = column || { rich: {} };

        return numeric ? 'right' : 'left';
    };

    getAlignment = (parentHeader, allColumns) => {
        const matchingColumns = allColumns.filter(c => c.parentHeaderName && c.parentHeaderName === parentHeader);
        if (matchingColumns.length > 1) {
            return 'left';
        }
        return this.getAlignmentForColumn(matchingColumns && matchingColumns[0]);
    };

    shouldShowField = (parentHeader, index, allColumns) => {
        // get start position of parent header
        const startIndex = _.indexOf(
            allColumns.map(c => c.parentHeaderName),
            parentHeader
        );
        return index === startIndex;
    };

    renderParentHeader = () => {
        const { columns, classes, rowHeight } = this.props;

        const calcColumns = columns.map((c, i) => ({
            ...c,
            showField: this.shouldShowField(c.parentHeaderName, i, columns),
            align: this.getAlignment(c.parentHeaderName, columns)
        }));

        return (
            <>
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {calcColumns.map(({ field, parentHeaderName, align, showField = true }) => (
                        <TableCell
                            onContextMenu={this.handleCellContextMenu}
                            component="div"
                            align={align}
                            variant="head"
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            key={field}
                            padding="none">
                            {showField && <div className={classes.tableCellHeadDiv}>{parentHeaderName}</div>}
                        </TableCell>
                    ))}
                </div>
            </>
        );
    };

    handleMenuClose = () => {
        this.setState({ ...initialState });
    };

    handleCheckedChange = column => event => {
        const { visibilities, onColumnVisibilityChanged } = this.props;
        const updated = getUpdatedRows(
            !column.visible,
            column,
            'visible',
            visibilities,
            (r1, r2) => r1.headerName === r2.headerName
        );
        const nothingChecked = updated.filter(v => v.visible).length === 0;
        if (!nothingChecked) {
            onColumnVisibilityChanged(updated);
        }
        event.stopPropagation();
    };

    handleCellContextMenu = event => {
        event.preventDefault();
        this.setState({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4
        });
    };

    renderMenuItems = () => {
        const { visibilities } = this.props;
        return visibilities.map(column => (
            <MenuItem key={column.field} onClick={this.handleCheckedChange(column)}>
                <Checkbox checked={column.visible} />
                <Typography>{column.headerName}</Typography>
            </MenuItem>
        ));
    };

    render() {
        const { classes, columns, rowHeight } = this.props;
        const { mouseX, mouseY } = this.state;
        const hasParentHeader = columns.filter(c => c.parentHeaderName).length > 0;
        return (
            <>
                {hasParentHeader && this.renderParentHeader()}
                <div
                    className={classes.tableRow}
                    style={{
                        height: rowHeight,
                        lineHeight: `${rowHeight}px`
                    }}>
                    {columns.map(c => (
                        <TableCell
                            onContextMenu={this.handleCellContextMenu}
                            variant="head"
                            component="div"
                            align={this.getAlignmentForColumn(c)}
                            className={clsx(classes.tableCell, classes.tableCellHead)}
                            style={{
                                top: rowHeight
                            }}
                            key={c.field}
                            padding="none">
                            <div className={classes.tableCellHeadDiv}>{c.headerName}</div>
                        </TableCell>
                    ))}
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

export default withStyles(styles)(DataTableHeader);
