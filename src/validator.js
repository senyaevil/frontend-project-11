// src/validator.js
export default class Validator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data) {
    return this.schema.validate(data, { abortEarly: false })
      .then(() => ({ isValid: true, errors: {} }))
      .catch((error) => {
        const errors = error.inner.reduce((acc, curr) => {
          const errorKey = curr.message?.key || curr.message;
          // Используем ключ ошибки напрямую
          acc._form = errorKey;
          return acc;
        }, {});
        return { isValid: false, errors };
      });
  }
}