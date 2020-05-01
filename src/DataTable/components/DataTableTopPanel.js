import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Pluralize from 'react-pluralize';
import ErrorIcon from '@material-ui/icons/Error';
import { Typography, Paper } from '@material-ui/core';
import DataTableSearchBox from './DataTableSearchBox';

const styles = theme => ({
    root: {
        display: 'flex',
        paddingBottom: '6px'
    },
    searchBox: {
        marginLeft: 'auto',
        alignSelf: 'flex-end'
    },
    alertContainer: {
        display: 'flex',
        padding: '0px 2px 0px 2px',
        color: '#fff',
        fontWeight: theme.typography.fontWeightMedium,
        backgroundColor: theme.palette.error.main
    },
    alertIcon: {
        margin: '2px'
    },
    alertLabel: {
        margin: '2px'
    }
});

export class DataTableTopPanel extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        const { errorCount } = this.props;
        return errorCount !== nextProps.errorCount;
    }

    render() {
        const { classes, showFilter, showErrors, errorCount, onSearchTextChanged } = this.props;

        if (!showFilter && !showErrors) {
            return null;
        }
        const showAlert = showErrors && !!errorCount;

        return (
            <div className={classes.root}>
                {showAlert && (
                    <Paper className={classes.alertContainer}>
                        <ErrorIcon className={classes.alertIcon} />
                        <Typography className={classes.alertLabel}>
                            <Pluralize singular="error" count={errorCount} />
                        </Typography>
                    </Paper>
                )}
                {showFilter && (
                    <div className={classes.searchBox}>
                        <DataTableSearchBox onSearchTextChanged={onSearchTextChanged} />
                    </div>
                )}
            </div>
        );
    }
}

export default withStyles(styles)(DataTableTopPanel);
