import axios from 'axios'

const axiosIstance = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
});