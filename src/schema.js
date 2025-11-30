import * as yup from 'yup'

const setupYupLocale = () => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.url' }),
    },
    mixed: {
      required: () => ({ key: 'errors.required' }),
      notOneOf: () => ({ key: 'errors.notOneOf' }),
    },
  })
}

export const createRssSchema = (existingUrls) => {
  setupYupLocale()

  return yup.string()
    .required()
    .url()
    .notOneOf(existingUrls)
}