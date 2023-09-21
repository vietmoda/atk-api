const i18n = require('i18n')
i18n.configure({
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    directory: './locales'
})

module.exports = i18n