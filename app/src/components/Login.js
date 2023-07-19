import React, { Component } from 'react';
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Container,
    Alert
} from 'reactstrap';
import './Login.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../actions/authActions';
import { clearErrors } from '../actions/errorActions';

//Navbar component
class Login extends Component {
    state = {
        email: '',
        password: '',
        msg: null
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool,
        error: PropTypes.object.isRequired,
        login: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired
    };

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();
        this.props.clearErrors();

        const { email, password } = this.state;

        const user = {
            email,
            password
        };

        //Attempt to login
        this.props.login(user);
    }

    componentDidUpdate(prevProp) {
        const { error, isAuthenticated } = this.props;
        if (error != prevProp.error) {
            //Check for login error
            if (error.id == 'LOGIN_FAIL') {
                this.setState({ msg: error.msg.msg });
            } else {
                this.setState({ msg: null });
            }
        }
    }

    render() {
        return (
            <Form className="login-form" onSubmit={this.onSubmit}>
                <h2 className="text-center">TA Course Matching Application</h2>
                <FormGroup>
                    <Label>Email</Label>
                    <Input type='email' placeholder='Email' name='email' onChange={this.onChange}></Input>
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <Input type='password' placeholder='Password' name='password' onChange={this.onChange}></Input>
                </FormGroup>
                <Button className="btn-large btn-dark btn-block">Login</Button>
                {this.state.msg ? (
                    <Alert color="danger">{this.state.msg}</Alert>
                ) : null}
            </Form>
        );
    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    error: state.error
});

export default connect(mapStateToProps, { login, clearErrors })(Login);