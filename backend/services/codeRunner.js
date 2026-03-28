const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// How each language is compiled/run
const RUNNERS = {
  javascript: {
    filename: 'main.js',
    run: (dir) => `node "${path.join(dir, 'main.js')}"`,
  },
  python: {
    filename: 'main.py',
    run: (dir) => `python "${path.join(dir, 'main.py')}"`,
  },
  c: {
    filename: 'main.c',
    compile: (dir) => `gcc "${path.join(dir, 'main.c')}" -o "${path.join(dir, 'main.exe')}"`,
    run: (dir) => `"${path.join(dir, 'main.exe')}"`,
  },
  cpp: {
    filename: 'main.cpp',
    compile: (dir) => `g++ "${path.join(dir, 'main.cpp')}" -o "${path.join(dir, 'main.exe')}"`,
    run: (dir) => `"${path.join(dir, 'main.exe')}"`,
  },
  java: {
    filename: 'Main.java',
    compile: (dir) => `javac "${path.join(dir, 'Main.java')}"`,
    run: (dir) => `java -cp "${dir}" Main`,
  },
};

const TIMEOUT_MS = 10000; // 10 second execution limit

/**
 * Runs a shell command with optional stdin and returns stdout/stderr.
 */
const execWithStdin = (command, stdin, timeoutMs) =>
  new Promise((resolve) => {
    const proc = exec(
      command,
      { timeout: timeoutMs, maxBuffer: 1024 * 512 },
      (error, stdout, stderr) => {
        resolve({ stdout: stdout || '', stderr: stderr || '', error });
      }
    );
    if (stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });

/**
 * Executes code locally using the installed system compilers.
 * Creates a temp directory, writes the file, compiles (if needed), runs.
 *
 * @param {string} language - e.g. "python"
 * @param {string} code     - source code
 * @param {string} stdin    - standard input
 * @returns {{ stdout, stderr, compile_output, status, time, memory }}
 */
const runWithPiston = async (language, code, stdin = '') => {
  const runner = RUNNERS[language];
  if (!runner) {
    throw new Error(
      `Unsupported language: "${language}". Supported: ${Object.keys(RUNNERS).join(', ')}`
    );
  }

  // Create an isolated temp directory for this run
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codesync-'));

  try {
    // Write the source file
    const srcPath = path.join(tmpDir, runner.filename);
    fs.writeFileSync(srcPath, code, 'utf8');

    let compile_output = '';

    // Compile step (C, C++, Java)
    if (runner.compile) {
      const compileCmd = runner.compile(tmpDir);
      const { stdout, stderr, error } = await execWithStdin(compileCmd, '', 15000);
      compile_output = stderr || stdout || '';

      if (error && error.code !== 0) {
        // Compilation failed
        return {
          stdout: '',
          stderr: '',
          compile_output,
          status: 'Compilation Error',
          time: null,
          memory: null,
        };
      }
    }

    // Run step
    const runCmd = runner.run(tmpDir);
    const start = Date.now();
    const { stdout, stderr, error } = await execWithStdin(runCmd, stdin, TIMEOUT_MS);
    const elapsed = ((Date.now() - start) / 1000).toFixed(3);

    // Determine status
    let status = 'Accepted';
    if (error) {
      if (error.killed || error.signal === 'SIGTERM') {
        status = 'Time Limit Exceeded';
      } else if (error.code !== 0) {
        status = 'Runtime Error';
      }
    }

    return {
      stdout,
      stderr,
      compile_output,
      status,
      time: elapsed,
      memory: null,
    };
  } finally {
    // Cleanup temp directory
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
};

const getSupportedLanguages = () =>
  Object.keys(RUNNERS).map((name) => ({ name }));

module.exports = { runWithPiston, getSupportedLanguages, RUNNERS };
