import axios from 'axios';
import { USER_LOADED, USER_LOADING, LOGIN_FAIL, LOGIN_SUCCESS, LOGOUT_SUCCESS, AUTH_ERROR } from './types';
import { returnErrors } from './errorActions';

//Check token and load user
export const loadUser = () => (dispatch, getState) => {
    dispatch({ type: USER_LOADING });

    const token = getState().auth.token;
    const config = {
        headers: {
            "Content-type": "application/json",
        }
    }
    if (token) {
        config.headers["x-auth-token"] = token;
    }

    axios.get('/auth/user', tokenConfig(getState))
        .then(res => dispatch({
            type: USER_LOADED,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data, err.response.status));
            dispatch({
                type: AUTH_ERROR
            });
        });
}

//Login
export const login = ({ email, password }) => dispatch => {
    //Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    //Body
    const body = JSON.stringify({ email, password });

    axios.post('/auth', body, config)
        .then(res => dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data, err.response.status, 'LOGIN_FAIL'));
            dispatch({
                type: LOGIN_FAIL
            });
        });
};

//Logout
export const logout = () => {
    return {
        type: LOGOUT_SUCCESS
    };
};

export const tokenConfig = getState => {
    const token = getState().auth.token;
    const config = {
        headers: {
            "Content-type": "application/json",
        }
    }
    if (token) {
        config.headers["x-auth-token"] = token;
    }

    return config;
}