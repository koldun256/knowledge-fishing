
const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://localhost:8443';
  }
  return 'https://knowledge-fishing.ru';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  withCredentials: true
};
