import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    mainDiv: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '5px'
    }
});

const DataTableField = ({ classes, id, value, column, rowHeight, onDoubleClick, onKeyDown, onMouseDown, onBlur }) => {
    const { rich: { numeric = false } = {} } = column || { rich: {} };

    const handleDoubleClick = id => () => {
        onDoubleClick(id);
    };

    const handleKeyDown = id => event => {
        onKeyDown(event, id);
    };

    return (
        <div
            tabIndex={-1}
            id={id}
            role="textbox"
            title={value}
            onMouseDown={onMouseDown}
            onBlur={onBlur}
            onDoubleClick={handleDoubleClick(id)}
            onKeyDown={handleKeyDown(id)}
            className={classes.mainDiv}
            style={{
                textAlign: numeric ? 'right' : undefined,
                maxHeight: rowHeight,
                userSelect: 'none'
            }}>
            {value}
        </div>
    );
};

export default withStyles(styles)(DataTableField);
