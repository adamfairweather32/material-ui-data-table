import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const styles = theme => ({
    root: {
        paddingTop: '6px',
        display: 'flex',
        '& > *': {
            marginLeft: theme.spacing(1)
        }
    },
    button: {
        flex: 1,
        maxWidth: '100px',
        margin: '0 5px 0 0'
    }
});

export class DataTableBottomPanel extends Component {
    shouldComponentUpdate(nextProps) {
        const { canAdd, canDelete } = this.props;
        return canAdd !== nextProps.canAdd || canDelete !== nextProps.canDelete;
    }

    handleAdd = () => {
        const { onAddRequested } = this.props;
        onAddRequested();
    };

    handleDelete = () => {
        const { onDeleteRequested } = this.props;
        onDeleteRequested();
    };

    render() {
        logger.debug('DataTableBottomPanel render');
        const { classes, canAdd, canDelete } = this.props;
        return (
            <div className={classes.root}>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!canAdd}
                    onClick={this.handleAdd}
                    startIcon={<AddCircleIcon />}>
                    Add
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    disabled={!canDelete}
                    onClick={this.handleDelete}
                    startIcon={<DeleteIcon />}>
                    Delete
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(DataTableBottomPanel);
