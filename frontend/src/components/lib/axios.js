import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "https://chat-back-deploy-6ai8.onrender.com",
    withCredentials: true,
});