const remoteAddress = ((req) => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
});

module.exports = remoteAddress;