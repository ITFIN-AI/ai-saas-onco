const specialCharacter = '|';

export const parseSpecialStringToEmail = (str: string) => str.split(specialCharacter).join('.');

export const parseEmailToSpecialString = (email: string) => email.split('.').join(specialCharacter);
