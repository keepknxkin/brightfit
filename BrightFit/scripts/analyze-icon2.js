const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../assets/icon-source.png');

async function scanLine(data, width, height, fixed, axis) {
  const lum = (a, b) => {
    const x = axis === 'h' ? a : fixed;
    const y = axis === 'h' ? fixed : a;
    const i = (y * width + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  const len = axis === 'h' ? width : height;
  const vals = [];
  for (let i = 0; i < len; i++) vals.push(lum(i, i));
  return vals;
}

function findInnerPanelEdge(vals, fromStart = true) {
  // Outer white plateau (~254), then shadow dip (~240-250), then inner panel/content
  const step = fromStart ? 1 : -1;
  const start = fromStart ? 0 : vals.length - 1;
  const end = fromStart ? vals.length : -1;

  let inOuterWhite = true;
  let sawShadow = false;
  let innerEdge = null;

  for (let i = start; i !== end; i += step) {
    const v = vals[i];
    if (inOuterWhite && v >= 252) continue;
    if (inOuterWhite && v < 252) {
      sawShadow = true;
      inOuterWhite = false;
      continue;
    }
    if (sawShadow && v >= 252) {
      innerEdge = i;
      break;
    }
  }
  return innerEdge;
}

function findInnerPanelFarEdge(vals, fromStart = false) {
  const step = fromStart ? 1 : -1;
  const start = fromStart ? 0 : vals.length - 1;
  const end = fromStart ? vals.length : -1;

  let lastWhiteBeforeContent = null;
  for (let i = start; i !== end; i += step) {
    const v = vals[i];
    if (v >= 250) lastWhiteBeforeContent = i;
    if (v < 220 && lastWhiteBeforeContent !== null) return lastWhiteBeforeContent;
  }
  return lastWhiteBeforeContent;
}

async function main() {
  const { data, info } = await sharp(inputPath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const hLine = await scanLine(data, width, height, Math.floor(height / 2), 'h');
  const vLine = await scanLine(data, width, height, Math.floor(width / 2), 'v');

  const left = findInnerPanelEdge(hLine, true);
  const right = findInnerPanelFarEdge(hLine, false);
  const top = findInnerPanelEdge(vLine, true);
  const bottom = findInnerPanelFarEdge(vLine, false);

  console.log({ left, right, top, bottom, w: right - left, h: bottom - top });
}

main();
