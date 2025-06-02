// authHelpers.ts
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getUserRole = (): string | null => {
  return localStorage.getItem('rol');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token && !isTokenExpired(token);
};
