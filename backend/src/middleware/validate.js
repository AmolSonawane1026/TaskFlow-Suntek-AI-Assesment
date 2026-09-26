const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware factory to validate request data using Joi
 * Can be used as:
 *   validate(schema)                 // validates req.body by default
 *   validate(schema, 'params')       // validates req.params
 *   validate(schema, 'query')        // validates req.query
 *   validate({ body: s1, params: s2 }) // validates multiple targets at once
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    // If schema is a container with body/params/query keys
    if (schema && typeof schema === 'object' && !schema.isJoi && (schema.body || schema.params || schema.query)) {
      const errors = [];
      ['body', 'params', 'query'].forEach((key) => {
        if (schema[key]) {
          const { error, value } = schema[key].validate(req[key], {
            abortEarly: false,
            stripUnknown: key === 'body', // only strip unknown fields from body
          });

          if (error) {
            error.details.forEach((detail) => {
              errors.push({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
              });
            });
          } else if (value !== undefined) {
            req[key] = value;
          }
        }
      });

      if (errors.length > 0) {
        return ApiResponse.validationError(res, errors);
      }
      return next();
    }

    // Direct Joi schema on specific source (body, params, or query)
    if (!schema || typeof schema.validate !== 'function') {
      return next();
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: source === 'body',
    });

    if (error) {
      const extractedErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return ApiResponse.validationError(res, extractedErrors);
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
