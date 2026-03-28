const express = require('express');
const router = express.Router();
const {
  getExtensions,
  createExtension,
  updateExtension,
  deleteExtension,
} = require('../controllers/extensionController');

router.route('/').get(getExtensions).post(createExtension);
router.route('/:id').put(updateExtension).delete(deleteExtension);

module.exports = router;
