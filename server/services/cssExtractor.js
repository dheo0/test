/**
 * IR 노드 트리를 순회하여 반복되는 색상/폰트/간격 값을 CSS 변수로 추출합니다.
 * @param {object} ir - IR 루트 노드
 * @returns {{ variables: string, processedIr: object }}
 */
export function extractCSSVariables(ir) {
  const colorCount = {};
  const fontSizeCount = {};

  function traverse(node) {
    if (!node) return;
    const s = node.styles || {};
    if (s.backgroundColor) colorCount[s.backgroundColor] = (colorCount[s.backgroundColor] || 0) + 1;
    if (s.color) colorCount[s.color] = (colorCount[s.color] || 0) + 1;
    if (s.fontSize) fontSizeCount[s.fontSize] = (fontSizeCount[s.fontSize] || 0) + 1;
    (node.children || []).forEach(traverse);
  }

  traverse(ir);

  const variables = {};
  let colorIdx = 1;
  let fontIdx = 1;

  Object.entries(colorCount).forEach(([val, count]) => {
    if (count >= 2) {
      variables[`--color-${colorIdx++}`] = val;
    }
  });

  Object.entries(fontSizeCount).forEach(([val, count]) => {
    if (count >= 2) {
      variables[`--font-size-${fontIdx++}`] = val;
    }
  });

  const varLines = Object.entries(variables)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  const rootBlock = varLines ? `:root {\n${varLines}\n}\n` : '';

  return { rootBlock, variables };
}
