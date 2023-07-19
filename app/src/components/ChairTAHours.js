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
  Box,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

class ChairTAHours extends Component {
  constructor(props) {
    super(props);

    this.state = {
      course: '',
      courseCodes: [],
      courses: [],
      prevEnrollments: '',
      currEnrollments: '',
      taHours: '',
      prevTAHours: 0,
      newTAHours: 0,
    };
  }

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

  updateCourseAllocations = () => {
    axios
      .post(`/courses`, {
        code: this.state.course,
        taHours: this.state.newTAHours,
      })
      .then((res) => {
        toast.success('Update Successful');
      })
      .catch((err) => {
        toast.error('Update Failed');
      });
  };

  onTAHoursChangeHandler = (e) => {
    this.setState({ newTAHours: e.target.ariaValueNow });
  };

  componentDidMount() {
    this.getCoursesDropdown();
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

  render() {
    const { classes } = this.props;
    return (
      <Box
        display="flex"
        width="100%"
        flexDirection="column"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        alignContent="center"
      >
        {/* TA Hour Allocation Modification */}
        <div>
          <FormControl className={classes.formControl}>
            <InputLabel>Course Code</InputLabel>
            <Select
              value={this.state.course}
              onChange={this.handleCourseChange}
            >
              {this.state.courseCodes}
            </Select>
          </FormControl>
        </div>
        <div className="courseFields">
          <form noValidate autoComplete="off">
            <TextField
              id="filled-basic"
              label="Previous Enrollments"
              variant="filled"
              value={this.state.prevEnrollments}
            />
            <TextField
              id="filled-basic"
              label="Current Enrollments"
              variant="filled"
              value={this.state.currEnrollments}
            />
            <TextField
              id="filled-basic"
              label="Previous TA Hours"
              variant="filled"
              value={this.state.prevTAHours}
            />
            <TextField
              id="filled-basic"
              label="Adjusted TA Hours"
              variant="filled"
              value={this.state.newTAHours}
            />
          </form>
        </div>
        <div className="courseSlider">
          <Typography gutterBottom>
            Calculated TA Hours Allocation:
            <span> {this.state.taHours}</span>
          </Typography>
          <PrettoSlider
            aria-label="pretto slider"
            defaultValue={0}
            onChange={this.onTAHoursChangeHandler}
            valueLabelDisplay="on"
            marks={marks}
          />
        </div>
        <div className="courseButton">
          <Button
            variant="contained"
            color="primary"
            onClick={this.updateCourseAllocations}
          >
            Update
          </Button>
        </div>
      </Box>
    );
  }
}

export default withStyles(styles)(ChairTAHours);

const marks = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 25,
    label: '20',
  },
  {
    value: 50,
    label: '50',
  },
  {
    value: 75,
    label: '75',
  },
  {
    value: 100,
    label: '100',
  },
];

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
};

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

const PrettoSlider = withStyles({
  root: {
    color: '#60AFFE',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);
