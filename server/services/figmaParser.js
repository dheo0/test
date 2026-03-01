import { getFigmaClient } from '../utils/figmaClient.js';

// Figma 색상 객체 → CSS rgba 문자열
function toRGBA({ r, g, b, a = 1 }) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`;
}

// Figma fills → CSS background-color
function parseFill(fills = []) {
  const solid = fills.find((f) => f.type === 'SOLID' && f.visible !== false);
  return solid ? toRGBA(solid.color) : null;
}

// Figma 노드 → IR 노드 (재귀)
export function parseFigmaNode(node) {
  if (!node) return null;

  const SKIP_TYPES = ['CANVAS', 'DOCUMENT'];
  if (SKIP_TYPES.includes(node.type)) {
    // CANVAS/DOCUMENT는 자식만 반환
    const children = (node.children || []).map(parseFigmaNode).filter(Boolean);
    return children[0] || null;
  }

  const SUPPORTED = ['FRAME', 'GROUP', 'RECTANGLE', 'TEXT', 'IMAGE', 'VECTOR', 'ELLIPSE', 'COMPONENT', 'INSTANCE'];
  if (!SUPPORTED.includes(node.type)) {
    console.warn(`[figmaParser] 지원하지 않는 노드 타입: ${node.type} (id: ${node.id})`);
    return null;
  }

  const styles = {};

  // 크기
  if (node.absoluteBoundingBox) {
    styles.width = `${Math.round(node.absoluteBoundingBox.width)}px`;
    styles.height = `${Math.round(node.absoluteBoundingBox.height)}px`;
  }

  // 배경색
  const bg = parseFill(node.fills);
  if (bg) styles.backgroundColor = bg;

  // 불투명도
  if (node.opacity !== undefined && node.opacity !== 1) {
    styles.opacity = node.opacity.toFixed(2);
  }

  // 모서리 둥글기
  if (node.cornerRadius) styles.borderRadius = `${node.cornerRadius}px`;

  // 그림자
  if (node.effects?.length) {
    const shadow = node.effects.find((e) => e.type === 'DROP_SHADOW' && e.visible !== false);
    if (shadow) {
      styles.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${toRGBA(shadow.color)}`;
    }
  }

  // Auto Layout (Flexbox)
  if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
    styles.display = 'flex';
    styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    if (node.itemSpacing) styles.gap = `${node.itemSpacing}px`;
    if (node.paddingTop) styles.paddingTop = `${node.paddingTop}px`;
    if (node.paddingBottom) styles.paddingBottom = `${node.paddingBottom}px`;
    if (node.paddingLeft) styles.paddingLeft = `${node.paddingLeft}px`;
    if (node.paddingRight) styles.paddingRight = `${node.paddingRight}px`;
  }

  // 텍스트 스타일
  let irType = 'container';
  let content = '';

  if (node.type === 'TEXT') {
    irType = 'text';
    content = node.characters || '';
    if (node.style) {
      if (node.style.fontSize) styles.fontSize = `${node.style.fontSize}px`;
      if (node.style.fontWeight) styles.fontWeight = String(node.style.fontWeight);
      if (node.style.textAlignHorizontal) {
        styles.textAlign = node.style.textAlignHorizontal.toLowerCase();
      }
      const textColor = parseFill(node.fills);
      if (textColor) styles.color = textColor;
    }
  } else if (node.type === 'IMAGE') {
    irType = 'image';
  } else if (['VECTOR', 'ELLIPSE'].includes(node.type)) {
    irType = 'icon';
  }

  const children = (node.children || [])
    .map(parseFigmaNode)
    .filter(Boolean);

  return {
    type: irType,
    id: node.id.replace(/[^a-zA-Z0-9]/g, '-'),
    styles,
    content,
    src: '',
    children,
  };
}

/**
 * Figma 파일 전체를 IR로 변환
 */
export async function parseFigmaFile({ fileKey, token, nodeId }) {
  const client = getFigmaClient(token);

  const { data } = await client.get(`/files/${fileKey}`);
  const document = data.document;

  let targetNode = document;
  if (nodeId) {
    // 특정 노드 ID 찾기
    function findNode(n, id) {
      if (n.id === id) return n;
      for (const child of n.children || []) {
        const found = findNode(child, id);
        if (found) return found;
      }
      return null;
    }
    targetNode = findNode(document, nodeId);
    if (!targetNode) throw new Error(`Node ID ${nodeId}를 찾을 수 없습니다.`);
  }

  const ir = parseFigmaNode(targetNode);
  if (!ir) throw new Error('Figma 노드를 변환하지 못했습니다.');
  return ir;
}
