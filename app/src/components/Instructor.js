import "bootstrap/dist/css/bootstrap.min.css";
import DndTable from "./DndTable.js";
import { useState, Component, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavItem,
  NavbarToggler,
  Nav,
  NavLink,
} from "reactstrap";
import { Fragment } from "react";
import * as ReactBootstrap from "react-bootstrap";
import Logout from "./Logout";
import Button from "@material-ui/core/Button";
import axios from "axios";
import Questions from "./Questions";
let url = "/applicants/getAllApplicants";

// GET data from the applicant's schema from mongoDB
let getApplicants = async () => {
  let response = await axios({
    method: "GET",
    url: url,
  });
  let applicants = response.data;

  let k = 1;
  for (let applicant of applicants) {
    applicant.instructorRank = k++;
  }

  return applicants;
};
// do componentWillMount here

class Instructor extends Component {
  getInitialState() {
    return { items: [] };
  }
  async componentDidMount() {
    let applicantsView = document.getElementById("applicantsView");
    let questionsView = document.getElementById("questionsView");
    applicantsView.style.display = "block";
    questionsView.style.display = "none";
  }
  toggleFunctionViewApplicants() {
    let applicantsView = document.getElementById("applicantsView");
    let questionsView = document.getElementById("questionsView");

    applicantsView.style.display = "block";
    questionsView.style.display = "none";
  }

  toggleFunctionModifyQuestions() {
    let applicantsView = document.getElementById("applicantsView");
    let questionsView = document.getElementById("questionsView");

    applicantsView.style.display = "none";
    questionsView.style.display = "block";
  }
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
        <div>
          <Navbar color="dark" dark expand="sm" className="mb-5">
            <NavbarBrand className="text-light">
              Course Matching App{" "}
            </NavbarBrand>

            <NavbarBrand className="text-light">
              <Button
                variant="contained"
                value="CourseHours"
                onClick={this.toggleFunctionViewApplicants}
              >
                View Applicants
              </Button>
            </NavbarBrand>

            <NavbarBrand className="text-light">
              <Button
                variant="contained"
                value="MatchTa"
                onClick={this.toggleFunctionModifyQuestions}
              >
                Modify Questions
              </Button>
            </NavbarBrand>

            <NavbarToggler onClick={this.toggle} />
            <Nav className="ml-auto" navbar>
              {authLinks}
            </Nav>
          </Navbar>
        </div>
        <div id="questionsView">
          <Questions></Questions>
        </div>
        <div id="applicantsView">
          <DndTable></DndTable>
        </div>
      </div>
    );
  }
}

export default Instructor;
