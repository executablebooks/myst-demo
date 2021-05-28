export function trim(content: string) {
  const lines = content.split('\n');
  let left = Infinity;
  let hitContent = false;
  let start = 0;
  let end = lines.length;
  lines.forEach((line, i) => {
    const blank = line.trim().length === 0;
    if (blank && !hitContent) {
      start = i + 1;
      return;
    }
    if (blank) return;
    hitContent = true;
    const leading = line.search(/\S/);
    if (leading < left) {
      left = leading;
    }
    end = i;
  });
  return lines.map((line) => line.slice(left)).slice(start, end + 1).join('\n');
}
