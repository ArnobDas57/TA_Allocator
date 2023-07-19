import "bootstrap/dist/css/bootstrap.min.css";
import "./Chair.css";
import React, { useState, Component, useEffect } from "react";
import axios from "axios";
import Download from "./Download";
import { Progress } from "reactstrap";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Link,
  Switch,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Fragment } from "react";
import {
  Navbar,
  NavbarBrand,
  NavItem,
  NavbarToggler,
  Nav,
  NavLink,
} from "reactstrap";
import * as ReactBootstrap from "react-bootstrap";
import Logout from "./Logout";

import ChairTable from "./ChairTable.js";
import ChairTAHours from "./ChairTAHours.js";
let url = "/courses/getAllCourses";

const styles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
});

class Chair extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      show1: true,
      show2: false,
      loaded: 0,
      selectedLabel: null,
      allocatedTAs: null,
      courseUsedHours: null,
    };
  }

  componentDidMount = async () => {
    let applicantResponse = await axios({
      method: "GET",
      url: "/match/matchGet",
    });
    this.setState({ allocatedTAs: applicantResponse.data });

    let courseResponse = await axios({
      method: "GET",
      url: "/courses",
    });
    this.setState({ courseUsedHours: courseResponse.data });
  };

  componentDidUpdate = async () => {
    let applicantResponse = await axios({
      method: "GET",
      url: "/match/matchGet",
    });
    this.setState({ allocatedTAs: applicantResponse.data });

    let courseResponse = await axios({
      method: "GET",
      url: "/courses",
    });
    this.setState({ courseUsedHours: courseResponse.data });
  };

  toggleFunctionCH() {
    var x = document.getElementById("view1");
    var y = document.getElementById("view2");

    x.style.display = "block";
    y.style.display = "none";
  }

  toggleFunctionMT() {
    var x = document.getElementById("view1");
    var y = document.getElementById("view2");

    x.style.display = "none";
    y.style.display = "block";
  }

  checkMimeType = (event) => {
    //getting file object
    let files = event.target.files;
    //define message container
    let err = [];
    // list allow mime type
    const types = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    // loop access array
    for (var x = 0; x < files.length; x++) {
      // compare file type find doesn't matach
      if (types.every((type) => files[x].type !== type)) {
        // create error message and assign to container
        err[x] = files[x].type + " is not a supported format\n";
      }
    }
    for (var z = 0; z < err.length; z++) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(err[z]);
      event.target.value = null;
    }
    return true;
  };

  maxSelectFile = (event) => {
    let files = event.target.files;
    if (files.length > 3) {
      const msg = "Only 3 images can be uploaded at a time";
      event.target.value = null;
      toast.warn(msg);
      return false;
    }
    return true;
  };

  checkFileSize = (event) => {
    let files = event.target.files;
    let size = 2000000;
    let err = [];
    for (var x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err[x] = files[x].type + "is too large, please pick a smaller file\n";
      }
    }

    for (var z = 0; z < err.length; z++) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(err[z]);
      event.target.value = null;
    }
    return true;
  };

  onChangeHandler = (event) => {
    var files = event.target.files;
    if (
      this.maxSelectFile(event) &&
      this.checkMimeType(event) &&
      this.checkFileSize(event)
    ) {
      // if return true allow to setState
      this.setState({
        selectedFile: files,
        loaded: 0,
      });
    }
  };

  uploadHandler = () => {
    const data = new FormData();
    if (this.state.selectedFile == null) return;
    for (var x = 0; x < this.state.selectedFile.length; x++) {
      data.append("file", this.state.selectedFile[x]);
    }

    axios
      .post(`/allocation/upload`, data, {
        onUploadProgress: (ProgressEvent) => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100,
          });
        },
      })
      .then((res) => {
        toast.success("Upload Successful");
      })
      .catch((err) => {
        toast.error("Upload Failed");
      });
  };

  matchTAsHandler = async () => {
    if (!this.state.selectedLabel) {
      toast.error("Need to Select Priority");
      return;
    }
    let response = await axios({
      method: "GET",
      url: "/match/matchTAs/" + this.state.selectedLabel,
    });
    this.setState({ allocatedTAs: response.data });

    let courseResponse = await axios({
      method: "GET",
      url: "/courses",
    });
    this.setState({ courseUsedHours: courseResponse.data });
  };

  changeState = (e) => {
    this.setState({ selectedLabel: e });
  };

  render() {
    const authLinks = (
      <Fragment>
        <NavItem>
          <Logout />
        </NavItem>
      </Fragment>
    );

    return (
      <div>
        <ToastContainer />
        <div>
          <Navbar color="dark" dark expand="sm" className="mb-5">
            <NavbarBrand className="text-light">
              Course Matching App{" "}
            </NavbarBrand>

            <NavbarBrand className="text-light">
              <Button
                variant="contained"
                value="CourseHours"
                onClick={this.toggleFunctionCH}
              >
                Course Hours
              </Button>
            </NavbarBrand>

            <NavbarBrand className="text-light">
              <Button
                variant="contained"
                value="MatchTa"
                onClick={this.toggleFunctionMT}
              >
                Match TA'S
              </Button>
            </NavbarBrand>

            <NavbarToggler onClick={this.toggle} />
            <Nav className="ml-auto" navbar>
              {authLinks}
            </Nav>
          </Navbar>
        </div>
        <div id="view1">
          <div>
            <div className="container">
              <div className="offset-md-3 col-md-6">
                <div className="form-group files">
                  <label>Upload Your File </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={this.onChangeHandler}
                  />
                </div>

                <div className="form-group">
                  <Progress max="100" color="success" value={this.state.loaded}>
                    {Math.round(this.state.loaded, 2)}%
                  </Progress>
                </div>

                <button
                  type="button"
                  className="btn btn-success btn-block"
                  onClick={this.uploadHandler}
                >
                  Upload here
                </button>
              </div>
            </div>
          </div>
          <ChairTAHours></ChairTAHours>
        </div>

        <div id="view2">
          <div className="container">
            <div className="col-md-12 text-center">
              <ul>
                <li>
                  <ReactBootstrap.DropdownButton
                    className="Dropdown"
                    id="dropdown-basic-button"
                    title={this.state.selectedLabel ?? "Select Priority"}
                    onSelect={this.changeState}
                  >
                    <ReactBootstrap.Dropdown.Item eventKey="Applicant">
                      Applicant
                    </ReactBootstrap.Dropdown.Item>
                    <ReactBootstrap.Dropdown.Item eventKey="Instructor">
                      Instructor
                    </ReactBootstrap.Dropdown.Item>
                  </ReactBootstrap.DropdownButton>
                </li>
                <li>
                  <button
                    type="button"
                    className="Match"
                    onClick={this.matchTAsHandler}
                  >
                    Match
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <ChairTable
            data={this.state.allocatedTAs}
            courseData={this.state.courseUsedHours}
          ></ChairTable>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Chair);
