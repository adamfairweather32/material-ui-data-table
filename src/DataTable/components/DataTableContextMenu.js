import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Checkbox from '@material-ui/core/Checkbox';
import { Typography } from '@material-ui/core';
import { getUpdatedRows } from '../helpers/helpers';
import { COLUMN_HEADER_MENU_TARGET } from '../constants';

const styles = () => ({
    checkBox: {
        padding: 0
    },
    menuItem: {
        padding: '0px 5px 0px 5px',
        '&:nth-child(3)': {
            paddingTop: '5px' // takes into account the divider
        }
    },
    menuTitle: {
        padding: '0px 0px 0px 5px'
    }
});

export class DataTableContextMenu extends Component {
    handleCheckedChange = column => () => {
        const { onVisibilitiesChanged, visibilities } = this.props;
        const updated = getUpdatedRows(
            !column.visible,
            column,
            'visible',
            visibilities,
            (r1, r2) => r1.headerName === r2.headerName
        );
        const nothingChecked = updated.filter(v => v.visible).length === 0;
        if (!nothingChecked) {
            onVisibilitiesChanged(updated);
        }
    };

    renderMenuItems = () => {
        const { classes, visibilities } = this.props;
        return visibilities.map(column => (
            <MenuItem key={column.field} onClick={this.handleCheckedChange(column)} className={classes.menuItem}>
                <Checkbox className={classes.checkBox} checked={column.visible} />
                <Typography>{column.headerName}</Typography>
            </MenuItem>
        ));
    };

    renderColumnHeaderMenu = () => {
        const {
            classes,
            menuPosition: { mouseY, mouseX },
            onClose,
            open
        } = this.props;
        return (
            <ClickAwayListener onClickAway={onClose}>
                <Menu
                    keepMounted
                    open={open}
                    onClose={onClose}
                    anchorReference="anchorPosition"
                    anchorPosition={mouseY !== null && mouseX !== null ? { top: mouseY, left: mouseX } : undefined}
                    TransitionComponent={Fade}>
                    <MenuItem className={clsx(classes.menuItem, classes.menuTitle)}>
                        <Typography>Configure Columns</Typography>
                    </MenuItem>
                    <Divider />
                    {this.renderMenuItems()}
                </Menu>
            </ClickAwayListener>
        );
    };

    render() {
        const { type } = this.props;
        switch (type) {
            case COLUMN_HEADER_MENU_TARGET: {
                return this.renderColumnHeaderMenu();
            }
            default:
                return null;
        }
    }
}

export default withStyles(styles)(DataTableContextMenu);
