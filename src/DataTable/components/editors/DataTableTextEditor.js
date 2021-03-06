import React, { Component, forwardRef } from 'react';
import StyledOutlinedInput from '../../styled/StyledOutlinedInput';
import {
    isValidChar,
    markCellIsEditing,
    removeCellIsEditing,
    removeTextSelection,
    getFormattedCurrencyValue,
    translateKeyCodeToChar,
    getBlinkDirectionColour,
    setCaretPosition
} from '../../helpers/helpers';
import {
    ESC,
    CURRENCY_TYPE,
    NUMERIC_TYPE,
    ALPHA_TYPE,
    BLINK_CSS_PREFIX,
    DELETE,
    WARNING_COLOUR,
    ERROR_COLOUR,
    ENTER,
    DOWN,
    UP,
    LEFT,
    RIGHT
} from '../../constants';

class DataTableTextEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            clearOnType: true,
            enterEditing: false
        };
    }

    setCaretPositionToEnd = () => {
        const { value, id } = this.props;
        const length = value ? value.toString().length : 0;
        setCaretPosition(document.getElementById(id), length);
    };

    formatValue = value => {
        const { column } = this.props;
        const { editing } = this.state;

        const {
            rich: { currency }
        } = column;

        const { showCurrencySymbol = true } = currency || {};
        return !editing && currency && (value || value === 0)
            ? getFormattedCurrencyValue(value, showCurrencySymbol)
            : value;
    };

    canAcceptValue = () => {
        const { value, column } = this.props;
        const {
            rich: { numeric = false, currency },
            clearable = false
        } = column;

        if (value === '' && !clearable) {
            return false;
        }
        if (currency || numeric) {
            return !Number.isNaN(value) && !value.toString().endsWith('.');
        }
        return true;
    };

    enterEditMode = () => {
        const { id } = this.props;
        this.setState({
            enterEditing: true,
            editing: true
        });
        markCellIsEditing(id);
    };

    exitEditMode = () => {
        const { id } = this.props;
        this.setState({ editing: false });
        removeCellIsEditing(id);
    };

    cancelChange = () => {
        const { onCancel } = this.props;
        this.exitEditMode();
        onCancel();
    };

    commitChange = () => {
        const { onCommit } = this.props;
        const { editing } = this.state;
        if (editing && this.canAcceptValue()) {
            this.exitEditMode();
            onCommit();
        } else {
            this.cancelChange();
        }
    };

    parseValue = newValue => {
        const { column } = this.props;
        const {
            rich: { numeric = false, currency },
            clearable = false
        } = column;
        if (numeric || currency) {
            if (newValue && !Number.isNaN(newValue)) {
                return newValue;
            }
            if (!clearable) {
                return 0;
            }
        }
        return newValue;
    };

    getType = () => {
        const { column } = this.props;
        const {
            rich: { numeric = false, currency }
        } = column;

        if (currency) {
            return CURRENCY_TYPE;
        }
        if (numeric) {
            return NUMERIC_TYPE;
        }
        return ALPHA_TYPE;
    };

    handleKeyDown = e => {
        logger.debug('DataTableTextEditor handleKeyDown');
        const { editing } = this.state;
        const { column, row, value, dataId, onCellChange, onActivateEditor, onDeactivateEditor, onMove } = this.props;
        const {
            rich: { editable = false },
            clearable = false
        } = column;

        if ([UP, DOWN, LEFT, RIGHT, ENTER].includes(e.keyCode)) {
            if (editable) {
                this.commitChange();
            }
            onDeactivateEditor();
            onMove(e.keyCode);
            return;
        }
        if (e.keyCode === ESC) {
            if (editable) {
                this.cancelChange();
            }
            onDeactivateEditor();
            return;
        }
        if (editable && !editing && clearable && value && e.keyCode === DELETE) {
            onCellChange('', row, column.field, true);
        }
        if (
            editable &&
            !editing &&
            e.keyCode !== DELETE &&
            isValidChar(translateKeyCodeToChar(e.keyCode), this.getType())
        ) {
            this.setCaretPositionToEnd();
            this.enterEditMode();
        }
        if (editable) {
            onActivateEditor(dataId);
        }
    };

    handleFocus = () => {
        logger.debug('DataTableTextEditor handleFocus');
        const { value } = this.props;
        if (value) {
            removeTextSelection();
        }
    };

    handleDoubleClick = () => {
        logger.debug('DataTableTextEditor handleDoubleClick');
        const { editing } = this.state;
        if (!editing) {
            this.setState({ clearOnType: false });
            this.enterEditMode();
        }
    };

    handleChange = e => {
        const {
            onCellChange,
            row,
            column: { field }
        } = this.props;
        const valueToPublish = this.parseValue(e.target.value);
        onCellChange(valueToPublish, row, field);
    };

    handleKeyPress = () => {
        const {
            value,
            onCellChange,
            row,
            column: { field }
        } = this.props;
        const { enterEditing, clearOnType } = this.state;
        if (enterEditing) {
            if (value && clearOnType) {
                onCellChange('', row, field);
            }
            this.setState({ clearOnType: true, enterEditing: false });
        }
    };

    handleBlur = () => {
        const { onBlur } = this.props;
        this.commitChange();
        onBlur();
    };

    render() {
        const { value, column, id, dataId, inputRef } = this.props;
        const {
            rich: { numeric = false, editable = false, currency }
        } = column;

        const formattedValue = this.formatValue(value, currency);

        const stylingProps = {
            style: {
                textAlign: numeric ? 'right' : undefined,
                textOverflow: 'ellipsis'
            }
        };

        return (
            <StyledOutlinedInput
                id={id}
                data-id={dataId}
                value={formattedValue}
                autoComplete="off"
                title={formattedValue}
                onDoubleClick={this.handleDoubleClick}
                onKeyDown={this.handleKeyDown}
                onKeyPress={editable ? this.handleKeyPress : undefined}
                onChange={editable ? this.handleChange : undefined}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                inputProps={stylingProps}
                variant="outlined"
                inputRef={inputRef}
            />
        );
    }
}

export default forwardRef((props, ref) => <DataTableTextEditor {...props} inputRef={ref} />);
