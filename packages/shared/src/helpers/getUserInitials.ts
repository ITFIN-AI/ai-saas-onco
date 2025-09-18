export const getUserInitial = (name: string): string =>
  name
    .split(' ')
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .map((char) => char.toLocaleUpperCase())
    .join('');
