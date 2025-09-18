export const getUserIp = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://api64.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());

    return res?.ip || null;
  } catch {
    // silent catch
    return null;
  }
};
