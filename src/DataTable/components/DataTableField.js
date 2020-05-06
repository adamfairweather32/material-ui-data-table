import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    activeDiv: {
        outline: '#3f51b5 !important',
        outlineStyle: 'solid !important',
        outlineOffset: '-2px',
        outlineWidth: '2px !important'
    },
    mainDiv: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '5px'
    }
});

class DataTableField extends Component {
    shouldComponentUpdate(nextProps) {
        const { id, value, tracking } = this.props;
        const isTracking = tracking === id;
        const willBeTracking = nextProps.tracking === nextProps.id;
        const isChangingTrackingState = isTracking !== willBeTracking;
        return nextProps.id !== id || nextProps.value !== value || isChangingTrackingState;
    }

    handleDoubleClick = id => () => {
        const { onDoubleClick } = this.props;
        onDoubleClick(id);
    };

    handleKeyDown = id => event => {
        const { onKeyDown } = this.props;
        onKeyDown(event, id);
    };

    render = () => {
        const { classes, id, tracking, value, rowHeight, onMouseDown, column } = this.props;
        const { rich: { numeric = false } = {} } = column || { rich: {} };
        return (
            <div
                tabIndex={-1}
                id={id}
                role="textbox"
                title={value}
                onMouseDown={onMouseDown}
                onDoubleClick={this.handleDoubleClick(id)}
                onKeyDown={this.handleKeyDown(id)}
                className={tracking === id ? clsx(classes.mainDiv, classes.activeDiv) : classes.mainDiv}
                style={{
                    textAlign: numeric ? 'right' : undefined,
                    maxHeight: rowHeight,
                    userSelect: 'none'
                }}>
                {value}
            </div>
        );
    };
}

export default withStyles(styles)(DataTableField);
