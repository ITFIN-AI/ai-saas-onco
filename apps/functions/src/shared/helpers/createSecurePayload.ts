import cloneDeep from 'lodash.clonedeep';

export const createSecurePayload = (payload: any) => {
  const copy = cloneDeep(payload);
  if (typeof copy === 'object') {
    const propertiesToHide = [
      'apiSecret',
      'apiKey',
      'apiToken',
      'secretKey',
      'clientSecret',
      'access_token',
      'refresh_token',
      'accessToken',
    ];

    propertiesToHide.forEach((key) => {
      if (key in copy) {
        copy[key] = '*******';
      }
    });
  }

  return copy;
};
