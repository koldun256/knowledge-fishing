
const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return 'http://141.0.0.2:8000';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  withCredentials: true
};