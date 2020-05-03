import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    mainDiv: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '5px'
    }
});

class DataTableField extends Component {
    shouldComponentUpdate(nextProps) {
        const { id, value } = this.props;
        return nextProps.id === id && nextProps.value !== value;
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
        console.log('re-render');
        const { classes, id, value, rowHeight, onMouseDown, onBlur, column } = this.props;
        const { rich: { numeric = false } = {} } = column || { rich: {} };
        return (
            <div
                tabIndex={-1}
                id={id}
                role="textbox"
                title={value}
                onMouseDown={onMouseDown}
                onBlur={onBlur}
                onDoubleClick={this.handleDoubleClick(id)}
                onKeyDown={this.handleKeyDown(id)}
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
}

export default withStyles(styles)(DataTableField);
