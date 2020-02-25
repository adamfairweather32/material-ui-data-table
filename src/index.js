import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

//https://www.reddit.com/r/reactjs/comments/4a7a5u/how_do_you_deal_with_scrolling_issues_jank/

//change line height to adjust border position
//setting focused item during scroll is fucking stuff up. Maybe
//we should manually focus in the focus handler using document
//rather than using auto focus. And then we need to remember to refocus
//the cell when it scrolls back into view

//use naked material ui components
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
