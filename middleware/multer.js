const slugify = require('slugify')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/')
    },
    filename: function (req, file, cb) {

        const name = slugify(file.fieldname)

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, name + '-' + uniqueSuffix + '.jpg')
    }
})

const upload = multer({ storage: storage })

module.exports = upload

