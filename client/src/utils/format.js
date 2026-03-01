/**
 * 생성된 코드를 기본 포맷팅합니다.
 * Prettier standalone은 번들 크기가 크므로 경량 포맷터를 제공합니다.
 * 필요 시 prettier/standalone으로 교체 가능합니다.
 */

function indentHTML(html) {
  let result = '';
  let depth = 0;
  const lines = html
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('</')) depth = Math.max(0, depth - 1);
    result += '  '.repeat(depth) + line + '\n';
    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
      depth += 1;
    }
  }
  return result.trim();
}

function indentCSS(css) {
  return css
    .replace(/\{/g, ' {\n  ')
    .replace(/;/g, ';\n  ')
    .replace(/\n\s*\}/g, '\n}')
    .replace(/  \n}/g, '\n}')
    .trim();
}

export function formatHTML(code) {
  try {
    return indentHTML(code);
  } catch {
    return code;
  }
}

export function formatCSS(code) {
  try {
    return indentCSS(code);
  } catch {
    return code;
  }
}

export function formatJS(code) {
  // JS는 그대로 반환 (추후 prettier/babel 연동 가능)
  return code;
}
