const { runWithPiston } = require('../services/codeRunner');
const Extension = require('../models/Extension');

/**
 * POST /api/execute
 * Body: { language, code, stdin }
 * Returns: { stdout, stderr, compile_output, status, time, memory }
 */
const runCode = async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }
    if (code === undefined || code === null) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Apply enabled extensions (transform code before execution)
    let processedCode = code;
    const extensions = await Extension.find({ enabled: true });

    for (const ext of extensions) {
      try {
        // Each extension script is a function body receiving (code) and returning transformed code
        // eslint-disable-next-line no-new-func
        const transform = new Function('code', ext.script);
        processedCode = transform(processedCode);
      } catch (extErr) {
        console.warn(`⚠️  Extension "${ext.name}" failed: ${extErr.message}`);
      }
    }

    // Execute via Piston (no API key required)
    const result = await runWithPiston(language, processedCode, stdin);

    return res.json(result);
  } catch (error) {
    console.error('❌ Execute error:', error.message);
    return res.status(500).json({ error: error.message || 'Execution failed' });
  }
};

module.exports = { runCode };
