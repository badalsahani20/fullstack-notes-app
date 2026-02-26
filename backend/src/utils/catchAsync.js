export default (fn) => {
    return (req, res, next) => {
        // We execute the controller function (fn)
        // If it's a promise and it fails, .catch(next)
        // pushes the error to errorMiddleware automatically.
        fn(req, res, next).catch(next);
    }
}