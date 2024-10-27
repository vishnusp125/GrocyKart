//handle errors
const handleErrors = (err) => {
    let errors = { username: ' ', email: ' ', password: ' ', phoneNo: ' ' }
    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'that email is already registered'
        return errors;
    }
    //validation Errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}


const loginhandleErrors = (err) => {
    let errors = { username: ' ', password: ' ' }
    //incorrect username
    if (err.message === 'Incorrect username') {
        errors.username = 'Username is incorrect';
        return errors;
    }

    //incorrect password
    if (err.message === 'Incorrect Password') {
        errors.password = 'Password is incorrect'
        return errors;
    }
    //validation Errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

module.exports = { handleErrors, loginhandleErrors }