import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Component } from "react";
import AppNavbar from "./components/AppNavbar";
import Login from "./components/Login";
import Instructor from "./components/Instructor";
import Chair from "./components/Chair";
import Department from "./components/Department";
import Download from "./components/Download";
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/authActions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Logout } from "./components/Logout";
import { Link, Route, Switch } from "react-router-dom";

class App extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
  };

  componentDidMount() {
    store.dispatch(loadUser());
  }

  Department() {}

  render() {
    const { isAuthenticated, user } = this.props.auth;

    const loginView = <Login />;

    const instructorView = <Instructor />;

    const chairView = <Chair />;

    const departmentView = <Department />;

    return (
      <Provider store={store}>
        <html>
          <div className="App">
            {(isAuthenticated && user.role === "DEPARTMENT") ||
            (isAuthenticated &&
              (user.role === "CHAIR" || user.role === "INSTRUCTOR")) ? null : (
              <AppNavbar />
            )}
            {isAuthenticated ? null : loginView}
            {isAuthenticated && user.role == "INSTRUCTOR"
              ? instructorView
              : null}
            {isAuthenticated && user.role == "CHAIR" ? chairView : null}
            {isAuthenticated && user.role == "DEPARTMENT"
              ? departmentView
              : null}
          </div>
        </html>
      </Provider>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(App);
