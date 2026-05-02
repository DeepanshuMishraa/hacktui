import axios from "axios";

export const api = axios.create({
  baseURL: "https://hacker-news.firebaseio.com",
  timeout: 25000,
});
