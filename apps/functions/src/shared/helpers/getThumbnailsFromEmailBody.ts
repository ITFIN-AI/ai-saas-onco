import { decode } from 'js-base64';
export type HTMLBodyInBase64 = string;

const banned = ['https://achieveguru.lt.acemlnc.com/Prod/link-tracker'];

export const getThumbnailsFromEmailBody = (body: HTMLBodyInBase64) => {
  const str = decode(body);

  return str
    .match(/<img [^>]*src="[^"]*"[^>]*>/gm)
    ?.map((x) => x.replace(/.*src="([^"]*)".*/, '$1'))
    .filter((str) => banned.filter((banned) => str.startsWith(banned)).length === 0);
};
