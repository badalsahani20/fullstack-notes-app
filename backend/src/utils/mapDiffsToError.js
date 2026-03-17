export const mapDiffsToError = (diffs) => {
  let currPos = 0;
  const errors = [];

  diffs.forEach((part, index) => {
    if (part.removed) {
      const nextPart = diffs[index + 1];
      const suggestion = nextPart && nextPart.added ? nextPart.value : null;

      errors.push({
        start: currPos,
        end: currPos + part.value.length,
        original: part.value,
        suggestion,
      });

      currPos += part.value.length;
    } else if (part.added) {
      const prevPart = diffs[index - 1];
      if (!prevPart || !prevPart.removed) {
        errors.push({ start: currPos, end: currPos, original: "", suggestion: part.value });
      }
    } else {
      currPos += part.value.length;
    }
  });

  return errors;
};