import firebase from 'firebase/compat';

export const cloudFunctionErrorHandler = (e: unknown | Error | firebase.functions.HttpsError) => {
  if (typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string') {
    if (e.code === 'permission-denied') {
      return {
        code: 403,
        error: e,
      };
    }

    return {
      code: e.code === 'not-found' ? 404 : 500,
      error: e,
    };
  }

  return {
    code: 500,
    error: e,
  };
};
