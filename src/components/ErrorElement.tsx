import {Fragment, useEffect} from "react";
import {Alert} from "@trussworks/react-uswds";
import {showToast} from "./ShowToast.tsx";

export const ErrorElement = () => {
  useEffect(() => {
    showToast("Some of the data caused a crash. Probably format related.", "error");
  }, []);
  return (<Fragment>
    <h2>Error in App</h2>
    <Alert type={"error"} headingLevel={"h2"}>There was some unexpected error.</Alert>
    Try using the Reset Data button found in the bottom left of the screen.
  </Fragment>)
}
