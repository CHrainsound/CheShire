export const CHUNK_SIZE = 900;

function charBytes(code) {
  if (code > 0xffff) return 4;
  if (code > 0x7ff) return 3;
  if (code > 0x7f) return 2;
  return 1;
}

export function splitChunks(text, size = CHUNK_SIZE) {
  if (!text) return [""];
  const chunks = [];
  let start = 0;
  let bytes = 0;
  for (let i = 0; i < text.length; ) {
    const code = text.codePointAt(i);
    const width = code > 0xffff ? 2 : 1;
    const b = charBytes(code);
    if (bytes + b > size && i > start) {
      chunks.push(text.slice(start, i));
      start = i;
      bytes = 0;
      continue;
    }
    bytes += b;
    i += width;
  }
  chunks.push(text.slice(start));
  return chunks;
}
