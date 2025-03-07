const BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_BASE_URL
    : 'http://localhost:9000';

const API_BASE_URL = `${BASE_URL}/api`;

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getBaseUrl = (path) => `${BASE_URL}${path}`; 