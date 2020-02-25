import React from "react";
import DataTable from "./DataTable";
import "./styles.css";

export default function App() {
  const people = new Array(50000).fill(true).map((val, id) => ({
    id: id,
    firstName: Math.random()
      .toString(20)
      .substring(8),
    lastName: Math.random()
      .toString(20)
      .substring(8),
    age: Math.ceil(Math.random() * 80)
  }));
  //works ok with 20 but 30 screws up scroll so have to add 10
  //to table height (was originally 20 and 100)
  return (
    <div>
      {/* <h1>Records: {people.length}</h1> */}
      <DataTable rows={people} rowHeight={30} tableHeight={110} />
      {/* <div style={{ height: "25px" }} />
      <DataTable rows={people} rowHeight={30} tableHeight={110} />
      <div style={{ height: "25px" }} />
      <DataTable rows={people} rowHeight={30} tableHeight={110} /> */}
    </div>
  );
}
