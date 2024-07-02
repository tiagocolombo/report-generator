import { h } from "preact";
import React from "preact/compat";

const ReportTemplate = ({ name, last_name }) => (
  <div>
    <h1>Report</h1>
    <p>
      Name: {name} {last_name}
    </p>
    <div id='graph'>
      {/* Insert code for rendering graphs or other components here */}
    </div>
  </div>
);

export default ReportTemplate;
