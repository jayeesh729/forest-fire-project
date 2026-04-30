import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const detectFire = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Network error or server is unavailable.');
  }
};
export const detectFireLive = async (base64Image) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, {
      image: base64Image,
      minify: true
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Network error or server is unavailable.');
  }
};
