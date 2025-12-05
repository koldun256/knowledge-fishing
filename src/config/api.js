
const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return 'https://knowledge-fishing.ru';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  withCredentials: true
};
