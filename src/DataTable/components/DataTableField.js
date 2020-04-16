import React, { memo } from 'react';

const DataTableField = ({ id, value, column, onDoubleClick, onKeyDown }) => {
    const {
        rich: { numeric = false }
    } = column || { rich: {} };

    const handleMouseDown = event => {
        const element = document.getElementById(event.target.id);
        if (element) {
            element.classList.add('cell-selected');
            element.focus();
        }
        event.preventDefault();
    };
    const handleBlur = event => {
        const element = document.getElementById(event.target.id);
        if (element) {
            element.classList.remove('cell-selected');
        }
    };

    // only when the element is double clicked, typed into then we fire an event to say we need
    // to show the specific editor for this field
    return (
        <div
            tabIndex={-1}
            id={id}
            role="textbox"
            onMouseDown={handleMouseDown}
            onBlur={handleBlur}
            onDoubleClick={() => onDoubleClick(id)}
            onKeyDown={() => onKeyDown(id)}
            style={{
                border: '1px',
                borderStyle: 'solid',
                borderColor: 'grey',
                textAlign: numeric ? 'right' : undefined
            }}>
            {value}
        </div>
    );
};

const propsAreEqual = (prev, next) => {
    // return prev.value === next.value;
    return false; // TODO: there is a problem with this
};

export const MemoizedDataTableField = memo(DataTableField, propsAreEqual);

export default DataTableField;
