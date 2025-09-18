export const replaceDoubleBraces = (
  str: string,
  replacements: { [key: string]: string | number | null | boolean | object }
) => {
  return str.replace(/{{(.+?)}}/g, (_, g1: string) => String(replacements[g1]) || g1);
};
