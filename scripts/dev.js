#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST_INDEX = path.join(ROOT, 'dist', 'index.html');
const PORT = '3000';

function runStep(script, args = []) {
  execFileSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

if (!fs.existsSync(DIST_INDEX)) {
  const sourceDir = path.join(ROOT, 'source');
  const exportsInSource = fs.existsSync(sourceDir)
    ? fs.readdirSync(sourceDir).filter(f => f.endsWith('.html'))
    : [];
  const outHtml = path.join(ROOT, 'build', 'systole.html');

  if (exportsInSource.length === 1) {
    runStep('assemble-app.js', [path.join(sourceDir, exportsInSource[0]), '--out', outHtml]);
  } else {
    const synExport = path.join(ROOT, 'build', 'synthetic', 'export.html');
    const synRefs = path.join(ROOT, 'build', 'synthetic', 'refs');
    const synRefImgs = path.join(ROOT, 'build', 'synthetic', 'refs-images');
    runStep('synthetic-export.js', [synExport]);
    runStep('assemble-app.js', [synExport, '--refs', synRefs, '--ref-images', synRefImgs, '--out', outHtml]);
  }

  runStep('extract-content.js', [outHtml]);
  runStep('build-pwa.js', [outHtml]);
}

process.argv = [process.execPath, path.join(__dirname, 'serve.js'), PORT, path.join(ROOT, 'dist')];
require('./serve.js');
