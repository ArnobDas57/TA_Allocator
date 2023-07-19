import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import Download from './Download';
import axios from 'axios';
import './Department.css';
import { Progress } from 'reactstrap';
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
  MenuItem,
  withStyles,
  makeStyles,
  Input,
  Checkbox,
  ListItemText,
} from '@material-ui/core';
import * as Select2 from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Fragment } from 'react';
import { Navbar, NavbarBrand, NavItem, NavbarToggler, Nav } from 'reactstrap';
import Logout from './Logout';

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

//const currFile = null;
class Department extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      loaded: 0,
      selectedLabel: 'Applicant',
      open: false,
      newCourseCodes: [],
      currCourseCodes: [],
      courseCodes: [],
      courses: [],
      courseName: '',
      course: '',
      instructor: '',
      instructorsData: [],
      instructorNames: [],
      rerender: 0,
    };
  }

  checkMimeType = (event) => {
    //getting file object
    let files = event.target.files;
    //define message container
    let err = [];
    // list allow mime type
    const types = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    // loop access array
    for (var x = 0; x < files.length; x++) {
      // compare file type find doesn't matach
      if (types.every((type) => files[x].type !== type)) {
        // create error message and assign to container
        err[x] = files[x].type + ' is not a supported format\n';
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
      const msg = 'Only 3 images can be uploaded at a time';
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
        err[x] = files[x].type + 'is too large, please pick a smaller file\n';
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

  onClickHandler = () => {
    const data = new FormData();
    if (this.state.selectedFile == null) return;
    for (var x = 0; x < this.state.selectedFile.length; x++) {
      data.append('file', this.state.selectedFile[x]);
    }

    axios
      .post(`/${this.state.selectedLabel.toLowerCase() + 's'}/upload`, data, {
        onUploadProgress: (ProgressEvent) => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100,
          });
        },
      })
      .then((res) => {
        toast.success('Upload Successful');
      })
      .catch((err) => {
        toast.error('Upload Failed');
      });
  };

  changeState = (e) => {
    this.setState({ selectedLabel: e.target.textContent });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleClickOpen = () => {
    this.setState({ open: true });
    this.getCoursesDropdown();
    this.getInstructorsDropdown();
  };
  handleCourseChange = (e) => {
    this.setState({ course: e.target.value });
    this.state.courses.forEach((item) => {
      if (item.code === e.target.value) {
        let prevTAHours =
          item.prevTAHours != 0 ? item.prevTAHours : item.taHours;
        let calcTAHours = Math.ceil(
          (prevTAHours / item.prevEnrollments) * item.currEnrollments
        );

        this.setState({
          prevEnrollments: item.prevEnrollments,
          currEnrollments: item.currEnrollments,
          taHours: calcTAHours,
          prevTAHours: item.prevTAHours,
          newTAHours: item.taHours,
        });
      }
    });
  };

  handleCourseNameChange = (e) => {
    this.setState({ course: e.target.value });
  };

  handleInstructorChange = (e) => {
    // Find the professors courses
    const instructorCourses = this.state.instructorsData.map((item) => ({
      instructorName: item.name,
      courses: item.courses,
    }));

    const result = instructorCourses.filter(
      (item) => item.instructorName === e.target.value
    );
    this.setState({
      instructor: e.target.value,
      currCourseCodes: result[0].courses.join(', '),
    });
  };

  componentDidMount() {
    this.getCoursesDropdown();
    this.getInstructorsDropdown();
  }

  getCoursesDropdown() {
    axios
      .get(`/courses`)
      .then((res) => {
        this.setState({ courses: res.data });
        const elements = res.data.map((item) => (
          <MenuItem value={item.code} onClick={this.fillCouseAllocationFields}>
            {item.code}
          </MenuItem>
        ));
        this.setState({ courseCodes: elements });
      })
      .catch((err) => {});
  }

  getInstructorsDropdown() {
    axios
      .get(`/instructors`)
      .then((res) => {
        this.setState({ instructorsData: res.data });
        const elements = res.data.map((item) => (
          <MenuItem
            key={item.name}
            value={item.name}
            onClick={this.fillInstructorAllocationFields}
          >
            {item.name}
          </MenuItem>
        ));
        this.setState({ instructorNames: elements });
      })
      .catch((err) => {});
  }

  addInstructorCourses = () => {
    let str;
    if(this.state.currCourseCodes.length == 0 || this.state.currCourseCodes[0] == "") {
      str = `${this.state.course}`;
    } else {
      str = `${this.state.currCourseCodes}, ${this.state.course}`;
    }
    this.setState({ currCourseCodes: str });
  };

  deleteInstructorCourses = () => {
    let str = this.state.currCourseCodes
      .split(',')
      .map((s) => s.toUpperCase().trim())
      .filter((item) => item != this.state.course)
      .join(', ');
    this.setState({ currCourseCodes: str });
  };

  updateInstructorCourses = () => {
    let updatedCourses = this.state.currCourseCodes
      .split(',')
      .map((s) => s.toLowerCase().trim());

    // Check if the user inputted duplicate courses client-side
    let nonCourseDuplicate = updatedCourses.filter(
      (value, index) => updatedCourses.indexOf(value) === index
    );

    // Check if instructor's name was altered
    let instructorList = this.state.instructorsData;
    let instructorCheck = instructorList
      .map((item) => item.name)
      .includes(this.state.instructor);
    if (!instructorCheck) alert('Instructor name invalid');

    // Check if courses were altered
    let courseList = this.state.courses.map((item) => item.code);
    let courseCheck = nonCourseDuplicate.filter(
      (value) => !courseList.includes(value)
    );

    axios
      .post(`/instructors/courses`, {
        name: this.state.instructor,
        courses: nonCourseDuplicate,
      })
      .then((res) => {
        toast.success('Update Successful');
        this.getCoursesDropdown();
        this.getInstructorsDropdown();
      })
      .catch((err) => {
        toast.error('Update Failed');
      });

      this.setState({ rerender: 1 });
  };

  handleChange = (event) => {
    this.setState({ courseName: event.target.value });
  };

  handleChangeMultiple = (event) => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    this.setState({ courseName: event.target.value });
  };

  render() {
    const authLinks = (
      <Fragment>
        <NavItem>
          <Logout />
        </NavItem>
      </Fragment>
    );

    const { classes } = this.props;

    let popup;
    popup = (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Instructor Course Link</DialogTitle>
        {/* Instructors */}
        <DialogContent>
          <FormControl className="coursesDropdown">
            <InputLabel>Instructors</InputLabel>
            <Select
              value={this.state.instructor}
              onChange={this.handleInstructorChange}
            >
              {this.state.instructorNames}
            </Select>
          </FormControl>
          {/* Courses */}
          <FormControl className="coursesDropdown">
            <InputLabel id="demo-mutiple-checkbox-label">Courses</InputLabel>
            <Select
              value={this.state.course}
              onChange={this.handleCourseNameChange}
            >
              {this.state.courseCodes}
            </Select>
          </FormControl>
          <TextField
            id="filled-basic"
            label="Current Courses"
            variant="filled"
            className="coursesDropdown"
            value={this.state.currCourseCodes}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.addInstructorCourses}
          >
            Add
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.deleteInstructorCourses}
          >
            Remove
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.updateInstructorCourses}
          >
            Update
          </Button>
          <Button variant="outlined" onClick={this.handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );

    return (
      <div className="background">
        <Navbar color="dark" dark expand="sm" className="mb-5">
          <NavbarBrand className="text-light">Course Matching App </NavbarBrand>
          <NavbarBrand className="text-light">
            <Button
              variant="contained"
              value="Applicant"
              onClick={(e) => this.changeState(e)}
            >
              Applicant
            </Button>
          </NavbarBrand>

          <NavbarBrand className="text-light">
            <Button
              variant="contained"
              value="Instructor"
              onClick={(e) => this.changeState(e)}
            >
              Instructor
            </Button>
          </NavbarBrand>

          <NavbarBrand className="text-light">
            <Button
              variant="contained"
              value="Course"
              onClick={(e) => this.changeState(e)}
            >
              Course
            </Button>
          </NavbarBrand>
          <NavbarBrand className="text-light">
            <Button variant="contained" onClick={this.handleClickOpen}>
              Link Instructor
            </Button>
            {popup}
          </NavbarBrand>

          <NavbarToggler onClick={this.toggle} />
          <Nav className="ml-auto" navbar>
            {authLinks}
          </Nav>
        </Navbar>

        <div className="container">
          <div className="row">
            <div className="offset-md-3 col-md-6">
              <div className="form-group ">
                <h1> Welcome to {this.state.selectedLabel} Portal</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
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
                onClick={this.onClickHandler}
              >
                Upload here
              </button>
            </div>
          </div>
        </div>
        <Download data={this.state.selectedLabel} rerender={this.state.rerender}> {this.state.rerender = 0}</Download>
      </div>
    );
  }
}

export default Department;
