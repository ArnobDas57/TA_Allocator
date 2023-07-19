import React, { Component } from 'react';
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@material-ui/core';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

export default class ChairTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      open: false,
      currentItem: [],
      courseCodes: [],
      course: '',
      courseInfo: [],
      updatedHours: 0,
    };
  }

  componentDidMount() {
    this.getCoursesDropdown();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({ items: this.props.data });
    }
    if (prevProps.courseData !== this.props.courseData) {
      this.setState({ courseInfo: this.props.courseData });
    }
  }

  handleUpdate = () => {
    axios
      .post(`/match/update`, {
        email: this.state.currentItem[0].appEmail,
        newCode: this.state.course,
        newHours: this.state.updatedHours,
        oldCode: this.state.currentItem[0].code,
        oldHours: this.state.currentItem[0].hours,
      })
      .then((res) => {
        toast.success(res.data);
        this.updateCourses();
        this.updateApplicants();
        this.handleClose();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  handleRemove = () => {
    axios
      .post(`/match/remove`, {
        email: this.state.currentItem[0].appEmail,
        code: this.state.currentItem[0].code,
      })
      .then((res) => {
        toast.success(res.data);
        this.updateCourses();
        this.updateApplicants();
        this.handleClose();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  handleAdd = () => {
    axios
      .post(`/match/add`, {
        email: this.state.currentItem[0].appEmail,
        code: this.state.currentItem[0].code,
      })
      .then((res) => {
        toast.success(res.data);
        this.updateCourses();
        this.updateApplicants();
        this.handleClose();
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
  };

  handleCourseChange = (e) => {
    console.log(e.target.value);
    this.setState({ course: e.target.value });
  };

  handleHourChange = (e) => {
    this.setState({ updatedHours: e.target.value });
  };

  handleClickOpen = (item) => {
    this.state.currentItem[0] = item;
    this.state.updatedHours = this.state.currentItem[0].hours;
    this.state.course = this.state.currentItem[0].code;
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  updateCourses = async () => {
    let courseResponse = await axios({
      method: 'GET',
      url: '/courses',
    });
    this.setState({ courseInfo: courseResponse.data });
  };

  updateApplicants = async () => {
    let applicantResponse = await axios({
      method: 'GET',
      url: '/match/matchGet',
    });
    this.setState({ items: applicantResponse.data });
  };

  createTable = () => {
    let table = [];
    let count = 0;
    for (let app in this.state.items) {
      let children = [];
      if (app == 'empty') {
      } else {
        this.state.items[app].map((item, index) => {
          children.push(<TableCell key={count + 1}>{item.appName}</TableCell>);
          children.push(<TableCell key={count + 2}>{item.appEmail}</TableCell>);
          children.push(<TableCell key={count + 3}>{item.code}</TableCell>);
          children.push(<TableCell key={count + 4}>{item.hours}</TableCell>);
          children.push(
            <TableCell key={count + 5}>
              {item.matchStatus <= 0
                ? 'Unallocated'
                : item.matchStatus == 1
                ? 'Pending Instructor Decision'
                : item.matchStatus == 2
                ? 'Accepted'
                : 'Rejected'}
            </TableCell>
          );
          children.push(
            <TableCell key={count + 6}>
              <Button
                size="small"
                variant="contained"
                onClick={() => this.handleClickOpen(item)}
              >
                Change Allocation
              </Button>
            </TableCell>
          );
          if (item.matchStatus > 0) {
            children.push(
              <TableCell key={count + 7}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    this.handleClickOpen(item);
                    this.handleClose();
                    this.handleRemove();
                  }}
                >
                  Remove Allocation
                </Button>
              </TableCell>
            );
          } else {
            children.push(
              <TableCell key={count + 7}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    this.handleClickOpen(item);
                    this.handleClose();
                    this.handleAdd();
                  }}
                >
                  Re-Allocate
                </Button>
              </TableCell>
            );
          }
          table.push(<TableRow key={count}>{children}</TableRow>);
          children = [];
          count += 8;
        });
      }
    }
    return table;
  };

  updateMissingHours = () => {
    let table = [];
    let count = 0;
    let children = [];
    this.state.courseInfo.map((course, index) => {
      children.push(<TableCell key={count + 1}>{course.code}</TableCell>);
      children.push(<TableCell key={count + 2}>{course.used}</TableCell>);
      children.push(<TableCell key={count + 3}>{course.taHours}</TableCell>);
      children.push(
        <TableCell key={count + 4}>{course.taHours - course.used}</TableCell>
      );
      children.push(
        <TableCell key={count + 5}>
          {course.taHours - course.used == 0
            ? 'All Hours Filled'
            : 'Hours Still Required'}
        </TableCell>
      );
      table.push(<TableRow key={count}>{children}</TableRow>);
      children = [];
      count += 6;
    });

    return table;
  };

  getCoursesDropdown() {
    axios
      .get(`/courses`)
      .then((res) => {
        const elements = res.data.map((item) => (
          <MenuItem value={item.code}>{item.code}</MenuItem>
        ));
        this.setState({ courseCodes: elements });
      })
      .catch((err) => {});
  }

  render() {
    let popup;
    let itemCheck = this.state.items.length;
    if (this.state.open) {
      popup = (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Manually update applicant allocation.
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Applicant Name: {this.state.currentItem[0].appName}
            </DialogContentText>
            <DialogContentText>
              Applicant Email: {this.state.currentItem[0].appEmail}
            </DialogContentText>

            <FormControl fullWidth>
              <InputLabel>Course Code: </InputLabel>
              <Select
                value={this.state.course}
                onChange={this.handleCourseChange}
              >
                {this.state.courseCodes}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="hours"
              label="Allocated Hours"
              type="number"
              value={this.state.updatedHours}
              onChange={this.handleHourChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleUpdate}
              color="primary"
            >
              Update
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
      <div className="col-md-12">
        <Typography gutterBottom="true" variant="h6">
          Course Hour Status:
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Code</TableCell>
                <TableCell>Currently Allocated Hours</TableCell>
                <TableCell>Maximum Allocated Hours</TableCell>
                <TableCell>Hours Still Needed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{this.updateMissingHours()}</TableBody>
          </Table>
        </TableContainer>
        <br />
        <Typography gutterBottom="true" variant="h6">
          TA Allocation:
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Course Code</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{this.createTable()}</TableBody>
          </Table>
        </TableContainer>

        {popup}
      </div>
    );
  }
}
