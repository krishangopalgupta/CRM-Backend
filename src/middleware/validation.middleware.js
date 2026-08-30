import AppError from '../utils/AppError.js'
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const parsedData = schema.parse(req.body);
            req.body = parsedData;
            next();
        } catch (error) {
            throw new AppError(error.message, 401);
        }
    }
}

export default validate;