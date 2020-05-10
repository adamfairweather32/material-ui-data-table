import React, { Component, forwardRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { StyledTextFieldNoBorder } from '../../styled/StyledTextField';
import StyledAutocomplete from '../../styled/StyledAutocomplete';
import { markCellIsEditing, removeCellIsEditing, removeTextSelection, isValidChar } from '../../helpers/helpers';
import { WARNING_COLOUR, ESC, DELETE, ENTER, ALPHA_NUMERIC_TYPE } from '../../constants';

const styles = () => ({
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18
        }
    },
    autocompleteWrapper: {
        display: 'flex'
    },
    autocompleteRoot: {
        width: props => props.width,
        flex: '1'
    }
});
class DataTableAutoCompleteEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            editing: false,
            enterEditing: false
        };
    }

    canAcceptValue = () => {
        const { column, value } = this.props;
        const {
            rich: {
                autoComplete = {
                    free: false
                }
            }
        } = column;
        const { free } = autoComplete;

        return free || (value !== '' && autoComplete.options[value]);
    };

    enterEditMode = () => {
        const { id } = this.props;
        this.setState({
            enterEditing: true,
            editing: true
        });
        markCellIsEditing(id);
    };

    exitEditMode = (cancel = false) => {
        const { id, onCancel, onCommit } = this.props;
        this.setState({
            enterEditing: false,
            editing: false
        });
        removeCellIsEditing(id);
        if (cancel) {
            onCancel();
        } else {
            onCommit();
        }
    };

    commitChange = () => {
        const { editing } = this.state;
        if (editing) {
            const cancel = !this.canAcceptValue();
            this.exitEditMode(cancel);
        }
    };

    cancelChange = () => {
        removeTextSelection();
        this.exitEditMode(true);
    };

    handleChange = e => {
        const { column, row, onCellChange } = this.props;
        const { field } = column;
        console.log('e.target.value = ', e.target.value);
        onCellChange(e.target.value, row, field);
    };

    handleKeyPress = e => {
        const { onCellChange, row, column } = this.props;
        const { field } = column;
        const { enterEditing } = this.state;
        if (enterEditing) {
            const char = String.fromCharCode(e.which);
            onCellChange(char, row, field);
            this.setState({
                enterEditing: false
            });
        }
    };

    handleKeyDown = e => {
        if (e.keyCode === ESC) {
            this.cancelChange();
        }
        const { editing } = this.state;
        const { column, value, onCellChange, row } = this.props;
        const { clearable = false, field } = column;

        if (!editing && clearable && value && e.keyCode === DELETE) {
            onCellChange('', row, field, true);
        }
        if (!editing && e.keyCode !== DELETE && isValidChar(String.fromCharCode(e.keyCode), ALPHA_NUMERIC_TYPE)) {
            this.enterEditMode();
        }
        if (editing && e.keyCode === ENTER) {
            this.commitChange();
        }
    };

    handleBlur = () => {
        const { onBlur } = this.props;
        this.setState({ focused: false, editing: false });
        onBlur();
    };

    handleFocus = () => {
        console.log('DataTableAutoCompleteEditor handleFocus');
        const { onActivateEditor } = this.props;
        removeTextSelection();
        this.setState({ focused: true });
        onActivateEditor();
    };

    handleDropdownClick = e => {
        const isDropdownClick =
            e.target.tagName && (e.target.tagName.toUpperCase() === 'PATH' || e.target.tagName.toUpperCase() === 'SVG');

        if (isDropdownClick) {
            const { editing } = this.state;
            inputRef.current.focus();
            if (!editing) {
                this.enterEditMode();
            } else {
                this.exitEditMode();
            }
        }
    };

    handleAutocompleteChange = (e, item) => {
        const { id, onCellChange, row, column } = this.props;
        const { field } = column;
        if (item && item.value) {
            const { value } = item;
            this.setState({
                editing: false,
                enterEditing: false
            });
            removeCellIsEditing(id);
            onCellChange(value, row, field, true);
        }
    };

    render() {
        const { classes, id, dataId, column, value, warning, error, inputRef } = this.props;
        const { focused, editing } = this.state;
        const {
            rich: {
                editable = false,
                autoComplete = {
                    free: false
                }
            }
        } = column;
        const { free, options } = autoComplete;
        const openMenu = focused && editing;
        const option = options[value];
        const stylingProps = {
            style: {}
        };

        if (warning && !error) {
            stylingProps.style = {
                ...stylingProps.style,
                backgroundColor: WARNING_COLOUR
            };
        }
        const inputProps = {
            readOnly: !editing || !editable
        };
        return (
            <div className={classes.autocompleteWrapper}>
                <StyledAutocomplete
                    id={id}
                    data-id={dataId}
                    freeSolo={free}
                    value={option || value}
                    className={classes.autocompleteRoot}
                    onChange={this.handleAutocompleteChange}
                    readOnly
                    options={options}
                    open={openMenu}
                    onClick={this.handleDropdownClick}
                    classes={{
                        option: classes.option
                    }}
                    getOptionLabel={option => option.label || option}
                    renderOption={option => {
                        const { customLabelBuilder, label, value } = option;
                        if (customLabelBuilder) {
                            return <>{customLabelBuilder(option)}</>;
                        }
                        return <>{label || value}</>;
                    }}
                    disableClearable
                    renderInput={params => (
                        <StyledTextFieldNoBorder
                            {...params}
                            error={!!error}
                            title={error || warning || (option && option.label)}
                            variant="outlined"
                            inputRef={inputRef}
                            fullWidth
                            onChange={free ? this.handleChange : undefined}
                            onKeyDown={this.handleKeyDown}
                            onKeyPress={this.handleKeyPress}
                            onBlur={this.handleBlur}
                            onFocus={this.handleFocus}
                            inputProps={{
                                ...inputProps,
                                ...params.inputProps,
                                autoComplete: 'disabled',
                                style: {
                                    textOverflow: 'ellipsis'
                                },
                                ...stylingProps
                            }}
                        />
                    )}
                />
            </div>
        );
    }
}

export default withStyles(styles)(
    forwardRef((props, ref) => <DataTableAutoCompleteEditor {...props} inputRef={ref} />)
);
