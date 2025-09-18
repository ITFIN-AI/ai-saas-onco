export const enumValues = <T extends Object>(enumObject: T): T[keyof T][] => {
  return Object.keys(enumObject)
    .filter((key) => isNaN(Number(key)))
    .map((key) => enumObject[key as keyof T]);
};
