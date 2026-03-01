import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractCSSVariables } from './cssExtractor.js';
import { getOutputDir } from '../utils/env.js';

// IR type → HTML 시맨틱 태그 매핑
const TYPE_TAG = {
  container: 'div',
  text: 'p',
  image: 'img',
  button: 'button',
  input: 'input',
  icon: 'span',
};

function styleObjToCSS(styles = {}) {
  return Object.entries(styles)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      return `  ${prop}: ${v};`;
    })
    .join('\n');
}

function buildHTML(node, depth = 1) {
  if (!node) return '';
  const indent = '  '.repeat(depth);
  const tag = TYPE_TAG[node.type] || 'div';
  const cls = `node-${node.id}`;

  if (node.type === 'image') {
    return `${indent}<img class="${cls}" src="${node.src || ''}" alt="${node.content || 'image'}" />`;
  }

  if (node.type === 'input') {
    return `${indent}<input class="${cls}" placeholder="${node.content || ''}" />`;
  }

  const children = (node.children || [])
    .map((child) => buildHTML(child, depth + 1))
    .join('\n');

  const inner = node.content
    ? `${node.content}${children ? '\n' + children : ''}`
    : children;

  return `${indent}<${tag} class="${cls}">${inner ? '\n' + inner + '\n' + indent : ''}</${tag}>`;
}

function buildCSS(node, cssRules) {
  if (!node) return;
  const cls = `.node-${node.id}`;
  const rules = styleObjToCSS(node.styles || {});
  if (rules) cssRules.push(`${cls} {\n${rules}\n}`);
  (node.children || []).forEach((child) => buildCSS(child, cssRules));
}

function buildJS(node, handlers) {
  if (!node) return;
  if (node.type === 'button') {
    handlers.push(
      `document.querySelector('.node-${node.id}')?.addEventListener('click', () => {\n  // TODO: 버튼 동작 구현\n});`
    );
  }
  (node.children || []).forEach((child) => buildJS(child, handlers));
}

/**
 * IR → HTML/CSS/JS 파일 생성
 * @param {object} ir - 중간 표현 루트 노드
 * @returns {Promise<{ id: string, files: string[] }>}
 */
export async function generateCode(ir) {
  const id = uuidv4();
  // 로컬: ./output/{id}  |  Vercel: /tmp/output/{id}
  const dir = path.join(getOutputDir(), id);
  fs.mkdirSync(dir, { recursive: true });

  // HTML
  const bodyHTML = buildHTML(ir);
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
  <title>Generated Page</title>
</head>
<body>
${bodyHTML}
  <script src="script.js"></script>
</body>
</html>`;

  // CSS
  const { rootBlock } = extractCSSVariables(ir);
  const cssRules = [];
  buildCSS(ir, cssRules);
  const css = [
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    rootBlock,
    ...cssRules,
  ].join('\n\n');

  // JS
  const handlers = [];
  buildJS(ir, handlers);
  const js = handlers.length
    ? `document.addEventListener('DOMContentLoaded', () => {\n${handlers.map((h) => '  ' + h).join('\n')}\n});`
    : '';

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  fs.writeFileSync(path.join(dir, 'style.css'), css, 'utf-8');
  fs.writeFileSync(path.join(dir, 'script.js'), js, 'utf-8');

  return { id, files: ['index.html', 'style.css', 'script.js'] };
}
