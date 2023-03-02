//handle errors
const adminhandleErrors = (err) => {
    let errors = { adminname: ' ', password: ' ' }
    //validation Errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}


const loginhandleErrors = (err) => {
    let adminerrors = { adminname: ' ', password: ' ' }
    //incorrect username
    if (err.message === 'Incorrect username') {
        adminerrors.adminname = 'Username is incorrect';
        return adminerrors;
    }

    //incorrect password

    if (err.message === 'Incorrect Password') {
        adminerrors.password = 'Password is incorrect'
        return adminerrors;
    }




    //validation Errors
    if (err.message.includes('admin validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            adminerrors[properties.path] = properties.message;
        })
    }
    return adminerrors;
}

module.exports = { adminhandleErrors, loginhandleErrors }