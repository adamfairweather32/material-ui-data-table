import React, { Component, forwardRef } from 'react';
import DataTableAutoCompleteEditor from './editors/DataTableAutoCompleteEditor';
import DataTableAutoDateEditor from './editors/DataTableDateEditor';
import DataTableTextEditor from './editors/DataTableTextEditor';

import { getColumnType } from '../helpers/helpers';
import { COMBO_TYPE, DATE_TYPE } from '../constants';

class DataTableEditor extends Component {
    render() {
        const { column, inputRef, ...rest } = this.props;
        const type = column && getColumnType(column);
        if (!type) {
            return null;
        }
        switch (type) {
            case COMBO_TYPE: {
                return <DataTableAutoCompleteEditor column={column} {...rest} ref={inputRef} />;
            }
            case DATE_TYPE: {
                return <DataTableAutoDateEditor column={column} {...rest} ref={inputRef} />;
            }
            default: {
                return <DataTableTextEditor column={column} {...rest} ref={inputRef} />;
            }
        }
    }
}

export default forwardRef((props, ref) => <DataTableEditor {...props} inputRef={ref} />);
