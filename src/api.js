// src/api.js
import axios from 'axios';

export const fetchRSS = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  
  return axios.get(proxyUrl, { timeout: 5000 })
    .then((response) => {
      if (response.data.contents) {
        return response.data.contents;
      }
      throw new Error('Network response was not ok');
    })
    .catch((error) => {
      console.error('API error:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Network error');
      }
      throw new Error('Network error');
    });
}
