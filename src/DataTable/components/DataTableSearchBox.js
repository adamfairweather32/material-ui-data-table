import React, { Component } from 'react';
import StyledTextField from '../styled/StyledTextField';
import { ESC, SEARCH_DEBOUNCE_DELAY_SECS } from '../constants';

let timer = null;

export class DataTableSearchBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: ''
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { searchText } = this.state;
        return nextState.searchText !== searchText;
    }

    triggerChange = searchText => {
        const { onSearchTextChanged } = this.props;
        onSearchTextChanged(searchText);
    };

    handleSearchKeyDown = e => {
        if (e.keyCode === ESC) {
            clearTimeout(timer);
            this.setState({
                searchText: ''
            });
            timer = setTimeout(() => this.triggerChange(''), SEARCH_DEBOUNCE_DELAY_SECS);
        }
    };

    handleSearchChange = e => {
        clearTimeout(timer);
        const val = e.target.value;
        this.setState({
            searchText: e.target.value
        });
        timer = setTimeout(() => this.triggerChange(val), SEARCH_DEBOUNCE_DELAY_SECS);
    };

    render() {
        logger.debug('DataTableSearchBox render');
        const { searchText } = this.state;
        return (
            <>
                <StyledTextField
                    variant="outlined"
                    value={searchText}
                    placeholder="Search..."
                    onKeyDown={this.handleSearchKeyDown}
                    onChange={this.handleSearchChange}
                />
            </>
        );
    }
}

export default DataTableSearchBox;
