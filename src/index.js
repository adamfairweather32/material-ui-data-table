import React from 'react';
import ReactDOM from 'react-dom';

import pino from 'pino';
import App from './App';

process.env.LOG_LEVEL = 'info';
global.logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: { levelFirst: true, colorize: true }
});

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
