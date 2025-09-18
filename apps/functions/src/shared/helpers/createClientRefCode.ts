import referralCodes from 'referral-codes';

export const createClientRefCode = (count = 1, length = 10) =>
  referralCodes.generate({
    length,
    count,
  });
