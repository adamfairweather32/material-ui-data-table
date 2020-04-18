import React, { memo } from 'react';
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

const propsAreEqual = (prev, next) => {
    // TODO: there is a problem with this
    return false;
    // return prev.value === next.value;
};

export const MemoizedDataTableField = memo(withStyles(styles)(DataTableField), propsAreEqual);

export default withStyles(styles)(DataTableField);
