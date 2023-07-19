import React, { Component } from "react";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";

let getCourses = async () => {
  let instructors = await axios({
    method: "GET",
    url: `/instructors/getEmail/${localStorage.getItem("email")}`,
  });

  return instructors.data[0].courses;
};
let url = "/instructors/";

export default class Questions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courses: [],
      questions: [],
      open: false,
      courseCode: "",
      newQuestion: "",
      //operation 1: is adding new question
      //operation 2: is updating the current question
      operation: -1,
      indexToOperate: -1,
      enable: false,
    };
  }
  async UNSAFE_componentWillMount() {
    let courses = await getCourses();

    this.setState({ courses: courses });
  }
  //Clicking the add button
  handleClickAdd(e) {
    this.setState({ open: true });
    this.setState({ operation: 1 });
  }
  handleCourseCodeChange = (e) => {
    this.setState({ courseCode: e.target.value });
  };
  handleNewQuestion = (e) => {
    this.setState({ newQuestion: e.target.value });
  };
  handleClose(e) {
    this.setState({ open: false, newQuestion: ""  });
  }

  //Adding inside the dialog
  handleAdd(e) {
    if (this.state.newQuestion == "") {
      toast.error("Please fill in the question");
    } else {
      this.state.questions.push(this.state.newQuestion);

      axios({
        method: "post",
        url: url + `questions/${this.state.courseCode}`,
        data: this.state.questions,
      });
      this.setState({ newQuestion: "" });
      this.setState({ open: false });
    }
  }
  //Updating the question inside the database
  handleUpdateQuestion(e) {
    if (this.state.newQuestion == "") {
      toast.error("Please fill in the question");
    } else {
      this.state.questions[this.state.indexToOperate] = this.state.newQuestion;

      axios({
        method: "post",
        url: url + `questions/${this.state.courseCode}`,
        data: this.state.questions,
      });
      this.setState({ newQuestion: "" });
      this.setState({ open: false });
    }
  }

  //Clicking the update button
  handleClickUpdate(index, questions) {
    this.setState({ open: true });
    this.setState({ operation: 2 });
    this.setState({ newQuestion: questions });

    this.setState({ indexToOperate: index });
  }

  //Clicking the remove button
  handleClickRemove(index, questions) {
    this.setState({ indexToOperate: index });
    this.state.questions.splice(index, 1);
    axios({
      method: "post",
      url: url + `questions/${this.state.courseCode}`,
      data: this.state.questions,
    });
  }

  displayQuestion = async (e) => {
    let code = e.currentTarget.value.toUpperCase();
    this.setState({ courseCode: code });
    let response = await axios({
      method: "GET",
      url: url + `questions/${e.currentTarget.value.toString()}`,
    });
    this.setState({ enable: true });
    this.setState({ questions: response.data[0].questions });
  };
  render() {
    let popup;
    if (this.state.open && this.state.operation == 1) {
      popup = (
        <Dialog
          open={this.state.open}
          onClose={(e) => this.handleClose(e)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Question</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To add question to your course, please enter your question here.
            </DialogContentText>
             <DialogContentText>
              Course Code: {this.state.courseCode}
            </DialogContentText>
            <TextField
              questionRef={(ref) => {
                this.questionRef = ref;
              }}
              autoFocus
              margin="dense"
              id="question"
              label="Question:"
              type="text"
              fullWidth
              onChange={this.handleNewQuestion}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => this.handleClose(e)} color="primary">
              Cancel
            </Button>
            <Button onClick={(e) => this.handleAdd(e)} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      );
    }
    if (this.state.open && this.state.operation == 2) {
      popup = (
        <Dialog
          open={this.state.open}
          onClose={(e) => this.handleClose(e)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Question</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To update question to your course, please edit your question here.
            </DialogContentText>
             <DialogContentText>
              Course Code: {this.state.courseCode}
            </DialogContentText>
            <TextField
              questionRef={(ref) => {
                this.questionRef = ref;
              }}
              autoFocus
              margin="dense"
              id="question"
              label="Question:"
              type="text"
              value={this.state.newQuestion}
              fullWidth
              onChange={this.handleNewQuestion}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => this.handleClose(e)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={(e) => this.handleUpdateQuestion(e)}
              color="primary"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      );
    }
    return (
      <div>
      <ToastContainer />
        {this.state.courses.map((courses, index) => (
          <Button
            variant="contained"
            onClick={(e) => this.displayQuestion(e, "value")}
            color="primary"
            value={courses}
          >
            {courses}
          </Button>
        ))}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.questions.map((questions, index) => (
                <TableRow>
                  <TableCell id={index} value={questions}>
                    {questions}
                  </TableCell>
                  <TableCell>
                    <Button
                      id={index}
                      value={questions}
                      color="primary"
                      onClick={(e) => this.handleClickUpdate(index, questions)}
                    >
                      Update
                    </Button>
                    <Button
                      id={index}
                      value={questions}
                      onClick={(e) => this.handleClickRemove(index, questions)}
                      color="secondary"
                    >
                      {" "}
                      Remove{" "}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          disabled={!this.state.enable}
          variant="contained"
          color="secondary"
          onClick={(e) => this.handleClickAdd(e)}
        >
          {" "}
          Add New Question
        </Button>
        {popup}
      </div>
    );
  }
}
