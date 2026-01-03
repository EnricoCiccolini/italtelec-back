const express = require('express')
const router = express.Router()
const controllerItaltelec = require('../controllers/controllerItaltelec')
const upload = require('../middleware/multer')


router.get('/', controllerItaltelec.index)

router.get('/:id', controllerItaltelec.show)

router.patch('/image', controllerItaltelec.patchNameImage)


router.post('/:id/reviews', controllerItaltelec.postReview)

router.post('/', upload.single('image'), controllerItaltelec.store)

module.exports = router