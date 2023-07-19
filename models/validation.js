const {string} = require('joi')
const Joi = require('joi');

const applicantValidation = (data) => {
    const schema = Joi.object({
        code: Joi.string(),
        appName: Joi.string(),
        appEmail: Joi.string().email(),
        courseRank: Joi.number(),
        appStatus: Joi.number(),
        hours: Joi.number().min(5).max(10),
        qA: Joi.array()

    });
    return schema.validate(data);
};

const instructorValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string(),
        email: Joi.string().email(),
        courses: Joi.array()

    });
    return schema.validate(data);
};
module.exports.applicantValidation = applicantValidation;
module.exports.instructorValidation = instructorValidation;