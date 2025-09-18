import crypto from 'crypto';

type Params = {
  data: string;
  key: string;
  algorithm?: 'sha1' | 'sha256';
  encoding?: 'hex' | 'base64';
};

export const generateHmac = ({ data, key, algorithm = 'sha1', encoding = 'hex' }: Params) => {
  return crypto.createHmac(algorithm, new Buffer(key, 'hex')).update(data).digest(encoding);
};
