import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    mainDiv: {
        border: '1px',
        borderStyle: 'solid',
        borderColor: 'grey',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
});

const DataTableField = ({ classes, id, value, column, onDoubleClick, onKeyDown, onMouseDown, onBlur }) => {
    const {
        rich: { numeric = false }
    } = column || { rich: {} };

    return (
        <div
            tabIndex={-1}
            id={id}
            role="textbox"
            title={value}
            onMouseDown={onMouseDown}
            onBlur={onBlur}
            onDoubleClick={() => onDoubleClick(id)}
            onKeyDown={() => onKeyDown(id)}
            className={classes.mainDiv}
            style={{
                textAlign: numeric ? 'right' : undefined
            }}>
            {value}
        </div>
    );
};

export default withStyles(styles)(DataTableField);
