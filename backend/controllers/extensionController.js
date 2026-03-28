const Extension = require('../models/Extension');

// GET /api/extensions
const getExtensions = async (req, res) => {
  try {
    const extensions = await Extension.find().sort({ createdAt: -1 });
    res.json(extensions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/extensions
const createExtension = async (req, res) => {
  try {
    const { name, description, script } = req.body;
    const extension = await Extension.create({ name, description, script });
    res.status(201).json(extension);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/extensions/:id  (toggle enabled or update)
const updateExtension = async (req, res) => {
  try {
    const extension = await Extension.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!extension) return res.status(404).json({ error: 'Extension not found' });
    res.json(extension);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/extensions/:id
const deleteExtension = async (req, res) => {
  try {
    const extension = await Extension.findByIdAndDelete(req.params.id);
    if (!extension) return res.status(404).json({ error: 'Extension not found' });
    res.json({ message: 'Extension deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getExtensions, createExtension, updateExtension, deleteExtension };
