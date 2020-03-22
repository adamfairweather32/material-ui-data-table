import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

//https://www.reddit.com/r/reactjs/comments/4a7a5u/how_do_you_deal_with_scrolling_issues_jank/

//change line height to adjust border position
//when item is selected, simply making it the table cell
//look active and replace with the actual control. 
//If the user starts typing, double clicks then
//we should listen to the key down event on the table
//cell for a non navigating character and then we should
//focus the cell and invoke the key down event handler
//with the input

//use naked material ui components
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
