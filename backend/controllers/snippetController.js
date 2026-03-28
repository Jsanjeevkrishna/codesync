const Snippet = require('../models/Snippet');

// GET /api/snippets
const getSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find().sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/snippets/:id
const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/snippets
const createSnippet = async (req, res) => {
  try {
    const { title, language, code, stdin } = req.body;
    const snippet = await Snippet.create({ title, language, code, stdin });
    res.status(201).json(snippet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/snippets/:id
const updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json(snippet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/snippets/:id
const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet };
