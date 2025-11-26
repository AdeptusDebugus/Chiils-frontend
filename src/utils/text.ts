export const capitalizeFirstLetter = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const firstChar = trimmed.charAt(0);
  const upperFirst = firstChar.toUpperCase();

  if (firstChar === upperFirst) {
    return trimmed;
  }

  return `${upperFirst}${trimmed.slice(1)}`;
};







