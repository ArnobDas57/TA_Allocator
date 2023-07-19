import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import './Department.css';
import { Progress } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as ReactBootstrap from 'react-bootstrap';
import './Download.css';
import { Fragment } from 'react';
import { NavItem } from 'reactstrap';
import Logout from './Logout';
import { CsvToHtmlTable } from 'react-csv-to-table';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@material-ui/core';

let clear = false;
class Download extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: 0,
      csvData: '',
      code: '',
      name: '',
      lecHours: '',
      labTutHours: '',
      sections: '',
      open: false,
      addOpen: false,
      profname: '',
      email: '',
      courses: [],
      qA: [],
      answer: [],
      appStatus: '',
      hours: '',
      courseRank: '',
      instructorRank: '',
      courseCode: '',
      appName: '',
      appEmail: '',
      disabled: true,
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    this.handleCsv();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.handleCsv();
    }
    if(prevProps.rerender == 1) {
      this.handleCsv();
    }
  }

  onClickHandler = () => {
    const data = new FormData();

    axios
      .get(`/file/download/`, {
        onDownloadProgress: (ProgressEvent) => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100,
          });
        },
        params: { type: this.props.data },
      })
      .then((res) => {
        const a = document.createElement('a');
        const file = new Blob([res.data], { type: 'text/csv' });
        a.href = URL.createObjectURL(file);
        a.download = 'file.csv';
        a.click();

        URL.revokeObjectURL(a.href);
        a.remove();
        toast.success('Download Successful');
      })
      .catch((err) => {
        toast.error('Download Failed');
      });
  };

  handleCsv = () => {
    axios
      .get(`/file/download/`, {
        params: { type: this.props.data },
      })
      .then((res) => {
        //reformat Table
        res.data = res.data.replace(/['"]+/g, '');
        res.data = res.data.replaceAll('[', '');
        res.data = res.data.replaceAll(']', '');
        res.data = res.data.replace('code', 'Course Code');
        res.data = res.data.replace('lecHours', 'Lecture Hours');
        res.data = res.data.replace('labTutHours', 'Lab Hours');
        res.data = res.data.replace('sections', 'Sections');
        res.data = res.data.replace('appName', 'Applicant Name');
        res.data = res.data.replace('appEmail', 'Applicant Email');
        res.data = res.data.replace('appStatus', 'Applicant Status');
        res.data = res.data.replace('qA', 'Question & Answer');
        res.data = res.data.replace('hours', 'Hours');
        res.data = res.data.replace('email', 'Email');
        res.data = res.data.replace('courses', 'Courses');
        res.data = res.data.replace('courseRank', 'Course Rank');

        this.setState({
          csvData: res.data,
        });
      });
  };

  handleClose = () => {
    this.setState({ open: false, addOpen: false });
  };

  handleClickOpen = () => {
    this.setState({ open: true, addOpen: false });
  };

  //get course data, and post to course db
  addCourse = () => {
    let courseData = {
      code: this.state.code,
      name: this.state.name,
      lecHours: this.state.lecHours,
      labTutHours: this.state.labTutHours,
      sections: this.state.sections,
    };
    axios
      .post(`/${this.props.data.toLowerCase() + 's'}/newcourse`, courseData, {})
      .then((res) => {
        toast.success('Update Successful');
        this.handleClose();
        clear = true;
        this.handleCsv();
      })
      .catch((err) => {
        toast.error("Update Unsuccessful, Please check input fields");
      });
  };

  //set the states from input field
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  //get prev state of courses, append new input.
  handleText = (i) => (e) => {
    let courses = [...this.state.courses];
    courses[i] = e.target.value;
    this.setState({
      courses,
    });
  };
  addCourses = (e) => {
    e.preventDefault();
    let courses = this.state.courses.concat(['']);
    this.setState({
      courses,
    });
  };
  //get the info from input field and post to instructor db
  addInstructor = () => {
    let InstructorData = {
      name: this.state.profname,
      email: this.state.email,
      courses: this.state.courses,
    };
    axios
      .post(`/${this.props.data.toLowerCase() + 's'}/new`, InstructorData, {})
      .then((res) => {
        toast.success('Update Successful');
        this.handleClose();
        clear = true;
        this.handleCsv();
      })
      .catch((err) => {
        toast.error("Update Unsuccessful, Please check input fields");
      });
  };

  handleSelect(e) {
    this.setState({
      selectedLabel: e,
    });
  }
  divStyle = {
    padding: '0px,0px,20px,0px',
  };

  //used to dynamically add to state arrays (courses & qA)
  handleQuestion = (i) => (e) => {
    let qA = [...this.state.qA];
    qA[i] = e.target.value;
    this.setState({
      qA,
    });
  };

  addQuestion = (e) => {
    e.preventDefault();
    let qA = this.state.qA.concat(['']);
    this.setState({
      qA,
    });
  };

  //get the prev state, and append the new input to the state array
  handleAnswer = (i) => (e) => {
    let answer = [...this.state.answer];
    answer[i] = e.target.value;
    this.setState({
      answer,
    });
  };
  addAnswer = (e) => {
    e.preventDefault();
    let answer = this.state.answer.concat(['']);
    this.setState({
      answer,
    });
  };

  //get the applicant data from input fields and post the new data
  addApplicant = () => {
    let ApplicantData = {
      appName: this.state.appName,
      appEmail: this.state.appEmail,
      code: this.state.courseCode,
      courseRank: this.state.courseRank,
      hours: this.state.hours,
      appStatus: this.state.appStatus,
      //merge the question and answer array
      qA: this.mergeArrays(this.state.qA, this.state.answer),
    };
    console.log(ApplicantData)
    axios
      .post(`/${this.props.data.toLowerCase() + 's'}/new`, ApplicantData, {})
      .then((res) => {
        toast.success('Update Successful');
        this.handleClose();
        clear = true;
        this.handleCsv();
      })
      .catch((err) => {
        console.log(err)
        toast.error("Update Unsuccessful, Please check input fields");
      });
  };
  //merge the question and answer arrays from the input fields
  mergeArrays(questionArray, answerArray) {
    let qA = [];
    for (let i = 0; i < questionArray.length; i++) {
      qA.push(questionArray[i]);
      qA.push(answerArray[i]);
    }
    return qA;
  }

  //Only allow submission if all fields are completed
  handleSubmit = evt => {
    if (!this.applicantCanBeSubmitted()) {
      evt.preventDefault();
      return;
    }
  }

  applicantCanBeSubmitted() {
    let appName = this.state.appName;
    let appEmail = this.state.appEmail;
    let courseCode = this.state.courseCode;
    let courseRank = this.state.courseRank;
    let hours = this.state.hours;
    let appStatus = this.state.appStatus;
    let qA = this.state.qA;
    let answer = this.state.answer;

    if (clear == true) {
      for (let i = 0; i <= 1; i++) {
        this.setState({
          qA: [],
          answer: [],
          appStatus: '',
          hours: '',
          courseRank: '',
          courseCode: '',
          appName: '',
          appEmail: '',
        })
        clear = false
      }
    }
    let sameLength = false;
    if (qA != null && answer != null) {
      if (qA.length == answer.length) {
        sameLength = true;
      }
    }
    return (appName.length > 0 && appEmail.length > 0 && courseCode.length > 0 && courseRank.length > 0 && hours.length > 0 && appStatus.length > 0 && qA.length > 0 && answer.length > 0 && sameLength)
  }

  courseCanBeSubmitted() {
    let {code,name,lecHours,labTutHours,sections} = this.state;
    if(this.clear == true){
      for(let i=0; i<=1; i++){
        this.setState({
          code: '',
          name: '',
          lecHours: '',
          labTutHours: '',
          sections: '',
        })
        clear = false
      }
    }
    return (code.length > 0 && name.length > 0 && lecHours.length > 0 && labTutHours.length > 0 && sections.length > 0)
  }

  instructorCanBeSubmitted(){
    let {profname, email,courses} = this.state;
    if(clear == true){
      for(let i=0; i<=1; i++){
        this.setState({
          profname: '',
          email: '',
          courses: [],
        })
        clear = false
      }
    }
    return (profname.length > 0 && email.length > 0)
  }

  render() {
    const authLinks = (
      <Fragment>
        <NavItem>
          <Logout />
        </NavItem>
      </Fragment>
    );

    let popup;
    if (this.state.open && this.props.data === 'Course') {
      const isEnabled = this.courseCanBeSubmitted();
      popup = (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          onSubmit={this.handleSubmit}
        >
          <DialogTitle id="form-dialog-title">
            Add Course information.
          </DialogTitle>
          <DialogContent>
          <DialogContentText>
            Please Fill Out All Fields!
          </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="code"
              id="code"
              label="Course Code"
              type="text"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="name"
              id="name"
              label="Course Name"
              type="text"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="lecHours"
              id="lecHours"
              label="Lecture Hours"
              type="number"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="labTutHours"
              id="labTutHours"
              label="labTutHours"
              type="number"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="sections"
              id="sections"
              label="Sections"
              type="number"
              onChange={this.handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" 
            onClick={this.addCourse} 
            color="primary" 
            disabled = {!isEnabled}>
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleClose}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (this.state.open && this.props.data === 'Instructor') {
      const isEnabled = this.instructorCanBeSubmitted();
      popup = (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          onSubmit={this.handleSubmit}
        >
          <DialogTitle id="form-dialog-title">
            Add Instructor information.
          </DialogTitle>
          <DialogContent>
          <DialogContentText>
            Please Fill Out All Fields!
          </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="profname"
              id="profname"
              label="Instructor Name"
              type="text"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="email"
              id="email"
              label="Instructor Email"
              type="email"
              onChange={this.handleChange}
              fullWidth
            />

            <Fragment>
              {this.state.courses.map((course, index) => (
                <span key={index}>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="courses"
                    id="courses"
                    label="Course"
                    type="text"
                    value={course}
                    onChange={this.handleText(index)}
                    fullWidth
                  />
                </span>
              ))}
              <Button
                margin="dense"
                variant="outlined"
                onClick={this.addCourses}
                color="primary"
              >
                Add New Course
              </Button>
            </Fragment>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.addInstructor}
              color="primary"
              disabled={!isEnabled}
            >
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleClose}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (this.state.open && this.props.data === 'Applicant') {
      const isEnabled = this.applicantCanBeSubmitted();
      popup = (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          onSubmit={this.handleSubmit}
        >
          <DialogTitle id="form-dialog-title">
            Add Applicant information.
          </DialogTitle>
          <DialogContent>
          <DialogContentText>
            Please Fill Out All Fields!
          </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="courseCode"
              id="courseCode"
              label="Course Code"
              type="text"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="appName"
              id="appName"
              label="Applicant Name"
              type="text"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="appEmail"
              id="appEmail"
              label="Applicant Email"
              type="email"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="appStatus"
              id="appStatus"
              label="Applicant Status"
              type="number"
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="hours"
              id="hours"
              label="TA Hours"
              type="number"
              InputProps = {{ inputProps: {min: 5, max:10}}}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="courseRank"
              id="courseRank"
              label="Course Rank"
              type="number"
              onChange={this.handleChange}
              fullWidth
            />

            <Fragment>
              {this.state.qA.map((question, index) => (
                <span key={index}>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="qA"
                    id="qA"
                    label="Application Question"
                    type="text"
                    value={question}
                    onChange={this.handleQuestion(index)}
                    fullWidth
                  />

                  <TextField
                    autoFocus
                    margin="dense"
                    name="answer"
                    id="answer"
                    label="Application Answer"
                    type="text"
                    // value={answer}
                    onChange={this.handleAnswer(index)}
                    fullWidth
                  />
                </span>
              ))}
              <Button
                margin="dense"
                variant="outlined"
                onClick={this.addQuestion}
                color="primary"
              >
                Add New Question
              </Button>
            </Fragment>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.addApplicant}
              color="primary"
              disabled={!isEnabled}

            >
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleClose}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="offset-md-3 col-md-6">
              <div className="divstyle1"></div>

              <div className="form-group">
                <ReactBootstrap.DropdownButton
                  id="dropdown-basic-button"
                  title={this.props.data ?? 'Select Type'}
                  onSelect={this.handleSelect}
                >
                  <ReactBootstrap.Dropdown.Item eventKey="Applicant">
                    Applicant
                  </ReactBootstrap.Dropdown.Item>
                  <ReactBootstrap.Dropdown.Item eventKey="Course">
                    Course
                  </ReactBootstrap.Dropdown.Item>
                  <ReactBootstrap.Dropdown.Item eventKey="Instructor">
                    Instructor
                  </ReactBootstrap.Dropdown.Item>
                </ReactBootstrap.DropdownButton>
              </div>
              <div>
                <label>Download File</label>
              </div>
              <div className="form-group">
                <ToastContainer />
                <Progress max="100" color="success" value={this.state.loaded}>
                  {Math.round(this.state.loaded, 2)}%
                </Progress>
              </div>

              <button
                type="button"
                className="btn btn-success btn-block"
                onClick={this.onClickHandler}
              >
                Download
              </button>
              <div className="divstyle"></div>
            </div>
          </div>
        </div>

        <div className="TableBackground">
          <CsvToHtmlTable
            data={this.state.csvData}
            csvDelimiter=","
            tableClassName="table table-hover"
            background="white"
          ></CsvToHtmlTable>
          <Button
            variant="contained"
            color="secondary"
            onClick={this.handleClickOpen}
          >
            Add {this.props.data}
          </Button>
          {popup}
        </div>
      </div>
    );
  }
}

export default Download;
