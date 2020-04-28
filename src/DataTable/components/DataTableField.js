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

    return (
        <div
            tabIndex={-1}
            id={id}
            role="textbox"
            title={value}
            onMouseDown={onMouseDown}
            onBlur={onBlur}
            onDoubleClick={() => onDoubleClick(id)}
            onKeyDown={event => onKeyDown(event, id)}
            className={classes.mainDiv}
            style={{
                textAlign: numeric ? 'right' : undefined,
                // borderStyle: 'solid',
                // borderWidth: '1px',
                maxHeight: rowHeight
            }}>
            {value}
        </div>
    );
};

export default withStyles(styles)(DataTableField);
