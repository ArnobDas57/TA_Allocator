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
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import "./DndTable.css";

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
function sortByProperty(property) {
  return function (a, b) {
    if (a[property] > b[property]) return 1;
    else if (a[property] < b[property]) return -1;

    return 0;
  };
}
let arrayButtons = [];

let url = "/applicants/";
let getApplicants = async () => {
  let response = await axios({
    method: "GET",
    url: url + `getAllApplicants`,
  });
  let instructors = await axios({
    method: "GET",
    url: `/instructors/getEmail/${localStorage.getItem("email")}`,
  });
  let currentApplicant = response.data;
  let applicants = [];
  let currentCourses = instructors.data[0].courses;
  for (let course of currentCourses) {
    for (let applicant of currentApplicant) {
      //If there is applicant for that specific course, push them into the array
      if (applicant.code.toLowerCase() == course.toString()) {
        applicants.push(applicant);
      }
    }
  }

  return applicants;
};
let getCourses = async () => {
  let instructors = await axios({
    method: "GET",
    url: `/instructors/getEmail/${localStorage.getItem("email")}`,
  });

  return instructors.data[0].courses;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: "rgb(255,235,235)",
  }),
});

export default class DndTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      courses: [],
      needsUpdate: false,
      open: false,
      matchStatus: "",
      email: "",
      code: "",
      singleItem: [],
      enable: false,
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  async UNSAFE_componentWillMount() {
    let data = await getCourses();

    this.setState({ courses: data });
  }

  //In order to display all the courses
  async displayCourse(e) {
    this.setState({ needsUpdate: false });
    let courseCode = e.currentTarget.value.toString().toUpperCase();

    let applicants = await getApplicants();
    let filtered = applicants.filter((applicant) => {
      return applicant.code === courseCode;
    });
    filtered.sort(sortByProperty("instructorRank"));

    filtered.forEach((app) => {
      if (app.instructorRank == -1) {
        this.setState({ needsUpdate: true });
      }
    });
    this.setState({ enable: true });
    this.setState({ items: filtered });
  }

  save() {
    let applicants = this.state.items;
    applicants.forEach((applicant) => {
      applicant.instructorRank = applicants.indexOf(applicant) + 1;
    });
    axios({
      method: "post",
      url: url + "updateInstructorRank",
      data: applicants,
    });

    toast.success("Applicant Rankings Saved");
    this.setState({ needsUpdate: false });
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reordering the list after dragging an dropping
    const updated = Array.from(this.state.items);
    const [temp] = updated.splice(result.source.index, 1);

    updated.splice(result.destination.index, 0, temp);

    this.setState({
      items: updated,
    });
  }

  updateMatchStatus() {
    let data = this.state.singleItem;

    axios({
      method: "post",
      url: url + "updateMatchStatus",
      data: data,
    });
    toast.success("Applicant Status Successfully Updated!");
    this.setState({ needsUpdate: false });
  }

  acceptFunction(item) {
    //item.matchStatus = 2;
    this.state.singleItem[0] = item;
    this.state.singleItem[0].matchStatus = 2;

    this.setState({ open: true });
    toast.success("TA Has Now Been Accepted!");
  }

  rejectFunction(item) {
    //item.matchStatus = 3;

    this.state.singleItem[0] = item;
    this.state.singleItem[0].matchStatus = 3;

    this.setState({ open: true });
    toast.success("TA Has Now Been Rejected!");
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    let notify;
    if (this.state.needsUpdate) {
      notify = (
        <Typography gutterBottom="true" variant="h6">
          Ranking of Applicants Required, Please Update Ranking
        </Typography>
      );
    }
    return (
      <div>
        <ToastContainer />
        {this.state.courses.map((courses, index) => (
          <Button
            variant="contained"
            onClick={(e) => this.displayCourse(e, "value")}
            color="primary"
            value={courses}
          >
            {courses}
          </Button>
        ))}
        {notify}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ranking</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Course Rank</TableCell>
                <TableCell>Status</TableCell>
                {this.state.items.map((item, index) => {
                  if (index % 3 == 0) {
                    <TableCell>{item.qA[index]}</TableCell>;
                  }
                })}
                <TableCell>Q/A</TableCell>
                <TableCell>Accept/Reject</TableCell>
              </TableRow>
            </TableHead>
            <TableBody component={DroppableComponent(this.onDragEnd)}>
              {this.state.items.map((items, index) => (
                <TableRow
                  component={DraggableComponent(items._id, index)}
                  key={items._id}
                >
                  <TableCell scope="row">{index + 1}</TableCell>
                  <TableCell>{items.appName}</TableCell>
                  <TableCell>{items.appEmail}</TableCell>
                  <TableCell>{items.hours}</TableCell>
                  <TableCell>{items.code}</TableCell>
                  <TableCell>{items.courseRank}</TableCell>
                  <TableCell>
                    {items.matchStatus <= 0
                      ? "Unallocated"
                      : items.matchStatus == 1
                      ? "Pending Instructor Decision"
                      : items.matchStatus == 2
                      ? "Accepted"
                      : "Rejected"}
                  </TableCell>
                  <TableCell>{items.qA}</TableCell>
                  <TableCell>
                    {items.matchStatus == 1 ? (
                      <div>
                        <Button
                          class="AcceptBtn"
                          onClick={() => {
                            this.acceptFunction(items);
                            this.handleClose();
                            this.updateMatchStatus();
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          class="RejectBtn"
                          onClick={() => {
                            this.rejectFunction(items);
                            this.handleClose();
                            this.updateMatchStatus();
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : items.matchStatus == 0 ? (
                      "Allocation pending"
                    ) : items.matchStatus == 2 ? (
                      "Already Accepted"
                    ) : (
                      "Already Rejected"
                    )}
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
          onClick={(e) => this.save()}
        >
          Save
        </Button>
      </div>
    );
  }
}

const DraggableComponent = (id, index) => (props) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
          {...props}
        >
          {props.children}
        </TableRow>
      )}
    </Draggable>
  );
};

const DroppableComponent = (onDragEnd: (result, provided) => void) => (
  props
) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"1"} direction="vertical">
        {(provided) => {
          return (
            <TableBody
              ref={provided.innerRef}
              {...provided.droppableProps}
              {...props}
            >
              {props.children}
              {provided.placeholder}
            </TableBody>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};
