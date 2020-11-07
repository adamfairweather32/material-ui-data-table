import React, { Component, forwardRef } from 'react';
import { format } from 'date-fns';
import InputMask from 'react-input-mask';
import InputAdornment from '@material-ui/core/InputAdornment';
import EventIcon from '@material-ui/icons/Event';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import { Calendar } from '@material-ui/pickers';
import StyledFormControl from '../../styled/StyledFormControl';
import StyledOutlinedInput from '../../styled/StyledOutlinedInput';
import {
    DATE_FORMAT_MASK,
    DATE_REGEX,
    ESC,
    DATE_FORMAT,
    NUMERIC_TYPE,
    ENTER,
    DELETE,
    WARNING_COLOUR,
    DOWN,
    UP,
    LEFT,
    RIGHT
} from '../../constants';
import {
    isValidChar,
    isNumPad,
    markCellIsEditing,
    removeCellIsEditing,
    isValidDate,
    setCaretPosition
} from '../../helpers/helpers';

const TextMaskWithInputMask = props => (
    <InputMask {...props} mask={DATE_FORMAT_MASK} style={{ textOverflow: 'ellipsis' }} />
);

class DataTableDateEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            showCalendar: false,
            enterEditing: false
        };
    }

    isWithinAcceptedDateRange = value => {
        const { range: { from, to } = {} } = this.props;
        const fromDate = from && isValidDate(from) ? new Date(from) : null;
        const toDate = to && isValidDate(to) ? new Date(to) : null;
        if (fromDate && toDate) {
            const date = new Date(value);
            return fromDate <= date && date <= toDate;
        }
        return true;
    };

    canAcceptValue = value =>
        value && isValidDate(value) && DATE_REGEX.test(value) && this.isWithinAcceptedDateRange(value);

    getAnchorElement = () => {
        const { id } = this.props;
        return document.getElementById(id);
    };

    enterEditMode = () => {
        logger.debug('DataTableDateEditor enterEditMode');
        const { id } = this.props;
        this.setState({
            editing: true,
            enterEditing: true
        });
        markCellIsEditing(id);
    };

    exitEditMode = cancel => {
        logger.debug('DataTableDateEditor exitEditMode');
        const { id, onCancel, onCommit } = this.props;
        this.setState({
            editing: false
        });
        if (cancel) {
            onCancel();
        } else {
            onCommit();
        }

        removeCellIsEditing(id);
    };

    commitChange = () => {
        logger.debug('DataTableDateEditor commitChange');
        const { editing } = this.state;
        const { value } = this.props;
        if (editing) {
            const cancel = !this.canAcceptValue(value);
            this.exitEditMode(cancel);
        }
    };

    cancelChange = () => {
        logger.debug('DataTableDateEditor cancelChange');
        this.exitEditMode(true);
    };

    handleCalendarChange = date => {
        logger.debug('DataTableDateEditor handleCalendarChange');
        const {
            row,
            column: { field },
            onCellChange
        } = this.props;
        this.setState({
            editing: false,
            showCalendar: false
        });
        onCellChange(format(date, DATE_FORMAT), row, field, true);
    };

    handleKeyPress = () => {
        logger.debug('DataTableDateEditor handleKeyPress');
        const { enterEditing } = this.state;
        const { id } = this.props;
        if (enterEditing) {
            setCaretPosition(document.getElementById(id), 0);
            this.setState({
                enterEditing: false
            });
        }
    };

    handleChange = event => {
        logger.debug('DataTableDateEditor handleChange value = ', event.target.value);
        if (event.target.value === '2___-__-__' || event.target.value === '') {
            return;
        }
        const {
            row,
            column: { field },
            onCellChange
        } = this.props;
        onCellChange(event.target.value, row, field);
    };

    handleKeyDown = e => {
        logger.debug('DataTableDateEditor handleKeyDown');
        const { column, onCellChange, onActivateEditor, onDeactivateEditor, onMove, dataId, row, value } = this.props;
        const {
            rich: { editable = false },
            clearable = false
        } = column;
        const { editing } = this.state;
        if (!editable) {
            return;
        }
        if (e.keyCode === ESC) {
            this.cancelChange();
        }
        if (!editing && clearable && value && e.keyCode === DELETE) {
            onCellChange('', row, column.field, true);
        }
        const keyCode = isNumPad(e.keyCode) ? e.keyCode - 48 : e.keyCode;
        if (!editing && e.keyCode !== DELETE && isValidChar(String.fromCharCode(keyCode), NUMERIC_TYPE)) {
            this.enterEditMode();
        }
        if (editing && e.keyCode === ENTER) {
            this.commitChange();
            onMove(DOWN);
        }
        if (!editing && [UP, DOWN, LEFT, RIGHT].includes(e.keyCode)) {
            onDeactivateEditor();
            onMove(e.keyCode);
            onActivateEditor(dataId);
        }
    };

    handleShowCalendar = () => {
        logger.debug('DataTableDateEditor handleShowCalendar');
        this.setState({
            showCalendar: true
        });
    };

    handleClose = () => {
        logger.debug('DataTableDateEditor handleClose');
        this.setState({
            showCalendar: false
        });
    };

    handleDoubleClick = () => {
        logger.debug('DataTableDateEditor handleDoubleClick');
        const { editing } = this.state;
        if (!editing) {
            this.enterEditMode();
        }
    };

    handleBlur = () => {
        logger.debug('DataTableDateEditor handleBlur');
        const { value } = this.props;
        const cancel = !this.canAcceptValue(value);
        if (cancel) {
            this.cancelChange();
        } else {
            this.commitChange();
        }
    };

    handleFocus = () => {
        logger.debug('DataTableDateEditor handleFocus');
        const { onActivateEditor } = this.props;
        onActivateEditor();
    };

    render() {
        const { editing, showCalendar } = this.state;
        const { id, inputRef, warning, error, column, value } = this.props;
        logger.debug('DataTableDateEditor render value = ', value);
        const {
            rich: {
                editable = false,
                date: { format: formatString }
            }
        } = column;
        const stylingProps = {
            style: {}
        };
        const inputProps = {
            readOnly: !editing || !editable
        };

        if (warning && !error) {
            stylingProps.style = {
                ...stylingProps.style,
                backgroundColor: WARNING_COLOUR
            };
        }
        return (
            <div>
                <StyledFormControl>
                    <StyledOutlinedInput
                        id={id}
                        error={!!error}
                        title={error || warning || value}
                        value={!editing && isValidDate(value) ? format(new Date(value), formatString) : value}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        onKeyPress={this.handleKeyPress}
                        onDoubleClick={this.handleDoubleClick}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        inputRef={inputRef}
                        inputComponent={TextMaskWithInputMask}
                        inputProps={{ ...inputProps, ...stylingProps }}
                        endAdornment={(
                            <InputAdornment position="end">
                                <IconButton onClick={this.handleShowCalendar}>
                                    <EventIcon />
                                </IconButton>
                            </InputAdornment>
                          )}
                    />
                </StyledFormControl>
                <Popover
                    open={showCalendar}
                    anchorEl={this.getAnchorElement()}
                    onClose={this.handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}>
                    <Calendar
                        date={isValidDate(value) ? new Date(value) : new Date()}
                        onChange={this.handleCalendarChange}
                        allowKeyboardControl
                    />
                </Popover>
            </div>
        );
    }
}

export default forwardRef((props, ref) => <DataTableDateEditor {...props} inputRef={ref} />);
