import axios from 'axios';
const API = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data;
};

export const register = async (username, email, password) => {
  const res = await axios.post(`${API}/auth/register`, { username, email, password });
  return res.data;
};
