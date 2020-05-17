export const CURRENCY_REGEX = /[0-9.-]/;
export const NUMERIC_REGEX = /[0-9]/;
export const ALPHA_NUMERIC_REGEX = /[a-zA-Z0-9]/;
export const ALPHA_REGEX = /[a-zA-Z]/;

export const NUMERIC_TYPE = 'numeric';
export const ALPHA_TYPE = 'alpha';
export const ALPHA_NUMERIC_TYPE = 'alpha_numeric';
export const CURRENCY_TYPE = 'currency';

export const SELECTOR = 'selector';
export const SEARCH_DEBOUNCE_DELAY_SECS = 500;

export const REGEX_MAP = {
    [NUMERIC_TYPE]: NUMERIC_REGEX,
    [ALPHA_NUMERIC_TYPE]: ALPHA_NUMERIC_REGEX,
    [ALPHA_TYPE]: ALPHA_REGEX,
    [CURRENCY_TYPE]: CURRENCY_REGEX
};

export const DEFAULT_MAX_SEARCH_DEPTH = 5;

export const AGG_TYPE_SUM = 'sum';
export const DEFAULT_AGG_TYPE = AGG_TYPE_SUM;

export const LEFT_DIR = 'left';
export const RIGHT_DIR = 'right';
export const UP_DIR = 'up';
export const DOWN_DIR = 'down';
export const HORIZONTAL_DIRECTIONS = [LEFT_DIR, RIGHT_DIR];
export const VERTICAL_DIRECTIONS = [UP_DIR, DOWN_DIR];

export const ID_FIELD_PREFIX = 'field';
export const IDENTIFIER_ATTRIBUTE = 'id';

export const COMBO_TYPE = 'combo';
export const DATE_TYPE = 'date';
export const TEXT_TYPE = 'text';

export const DECIMAL_PLACES = 2;
export const DATA_EDITING_PREFIX = 'data-editing';

export const DATE_FORMAT_MASK = '2999-99-99';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_REGEX = /[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;

export const ESC = 27;
export const LEFT = 37;
export const RIGHT = 39;
export const DOWN = 40;
export const UP = 38;
export const ENTER = 13;
export const DELETE = 46;

export const BLINK_CSS_PREFIX = 'blink';
export const BLINK_DIRECTION_POSITIVE = 'blue';
export const BLINK_DIRECTION_NEGATIVE = 'red';

export const WARNING_COLOUR = '#ffeb3b';
export const ERROR_COLOUR = '#f44336';

export const RESERVED_COLUMNS = ['validations', SELECTOR];
export const COLUMN_HEADER_MENU_TARGET = 'column-header';
