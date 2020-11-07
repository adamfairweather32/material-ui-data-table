import React, { Component, createRef } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import { getDescriptorOrValue, getBlinkDirectionColour, getFormattedCurrencyValue } from '../helpers/helpers';
import './DataTableField.css';

import { ERROR_COLOUR, WARNING_COLOUR, BLINK_CSS_PREFIX } from '../constants';

const MAIN_DIV_PADDING_PX = 5;
const OFFSET_PX = 1;

const styles = () => ({
    activeDiv: {
        outline: '#3f51b5 !important',
        outlineStyle: 'solid !important',
        outlineOffset: '-2px',
        outlineWidth: '2px !important'
        // transition:
        //     'outline 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, outline-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms'
    },
    mainDiv: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: `${MAIN_DIV_PADDING_PX}px`
    }
});

class DataTableField extends Component {
    constructor(props) {
        super(props);
        this.previousValue = createRef();
    }

    shouldComponentUpdate(nextProps) {
        const { id, value, tracking, editing, editorFocused, error, warning } = this.props;
        this.previousValue.current = value;
        // should only update this cell if it was previous tracking/editing and is no longer tracking/editing
        const isChangingTrackingState = this.isChangingState({ id, tracking }, nextProps, 'tracking', 'id');
        const isChangingEditingState = this.isChangingState({ id, editing }, nextProps, 'editing', 'id');
        const isEditorFocusedChange = editorFocused !== nextProps.editorFocused;

        return (
            nextProps.id !== id ||
            nextProps.value !== value ||
            isChangingTrackingState ||
            isChangingEditingState ||
            isEditorFocusedChange ||
            nextProps.error !== error ||
            nextProps.warning !== warning
        );
    }

    isChangingState = (state, newState, field, comparatorField) => {
        const currentState = state[field] === state[comparatorField];
        const nextState = newState[field] === state[comparatorField];
        return currentState !== nextState;
    };

    formatValue = (value, currency, showCurrencySymbol) =>
        currency && (value || value === 0) ? getFormattedCurrencyValue(value, showCurrencySymbol) : value;

    handleDoubleClick = id => () => {
        const { onDoubleClick } = this.props;
        onDoubleClick(id);
    };

    getCss = () => {
        const { editorFocused, tracking, id, value, column, classes } = this.props;
        const { rich: { blink = false } = {} } = column || { rich: {} };
        const blinkColour = blink ? getBlinkDirectionColour(value, this.previousValue.current) : null;
        return clsx(
            classes.mainDiv,
            editorFocused && tracking === id && classes.activeDiv,
            blinkColour && `${BLINK_CSS_PREFIX}-${blinkColour}`
        );
    };

    render = () => {
        logger.debug('DataTableField render');
        const { id, editing, warning, error, value, rowHeight, onMouseDown, column } = this.props;
        const { rich: { numeric = false, currency } = {} } = column || { rich: {} };
        const { warnNegative = true, showCurrencySymbol = true } = currency || {};
        const formattedValue = this.formatValue(value, currency, showCurrencySymbol);

        const showNegativeCurrencyWarning = warnNegative && currency && value < 0;
        let fooStyle = {
            textAlign: numeric ? 'right' : undefined,
            maxHeight: rowHeight,
            height: rowHeight - (MAIN_DIV_PADDING_PX * 2 + OFFSET_PX), // 1 = outline offset width
            userSelect: 'none',
            opacity: editing === id ? 0 : 1,
            textOverflow: 'ellipsis'
        };

        if (!warning && showNegativeCurrencyWarning) {
            fooStyle = {
                ...fooStyle,
                backgroundColor: ERROR_COLOUR
            };
        }
        if (warning && !error) {
            fooStyle = {
                ...fooStyle,
                backgroundColor: WARNING_COLOUR
            };
        }

        return (
            <div
                tabIndex={-1}
                id={id}
                role="textbox"
                title={error || warning || formattedValue}
                onMouseDown={onMouseDown}
                onDoubleClick={this.handleDoubleClick(id)}
                className={this.getCss()}
                style={fooStyle}>
                {getDescriptorOrValue(formattedValue, column)}
            </div>
        );
    };
}

export default withStyles(styles)(DataTableField);
