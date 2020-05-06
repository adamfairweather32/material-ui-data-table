import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

const MAIN_DIV_PADDING_PX = 5;
const OFFSET_PX = 1;

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
        padding: `${MAIN_DIV_PADDING_PX}px`
    }
});

class DataTableField extends Component {
    shouldComponentUpdate(nextProps) {
        const { id, value, tracking, editing } = this.props;

        const isChangingTrackingState = this.isChangingState({ id, tracking }, nextProps, 'tracking', 'id');
        const isChangingEditingState = this.isChangingState({ id, editing }, nextProps, 'editing', 'id');

        return nextProps.id !== id || nextProps.value !== value || isChangingTrackingState || isChangingEditingState;
    }

    isChangingState = (state, newState, field, comparatorField) => {
        const currentState = state[field] === state[comparatorField];
        const nextState = newState[field] === state[comparatorField];
        return currentState !== nextState;
    };

    handleDoubleClick = id => () => {
        const { onDoubleClick } = this.props;
        onDoubleClick(id);
    };

    render = () => {
        console.log('DataTableField render');
        const { classes, id, tracking, editing, value, rowHeight, onMouseDown, column } = this.props;
        const { rich: { numeric = false } = {} } = column || { rich: {} };
        return (
            <div
                tabIndex={-1}
                id={id}
                role="textbox"
                title={value}
                onMouseDown={onMouseDown}
                onDoubleClick={this.handleDoubleClick(id)}
                className={tracking === id ? clsx(classes.mainDiv, classes.activeDiv) : classes.mainDiv}
                style={{
                    textAlign: numeric ? 'right' : undefined,
                    maxHeight: rowHeight,
                    height: rowHeight - (MAIN_DIV_PADDING_PX * 2 + OFFSET_PX), // 1 = outline offset width
                    userSelect: 'none',
                    opacity: editing === id ? 0 : 1
                }}>
                {value}
            </div>
        );
    };
}

export default withStyles(styles)(DataTableField);
