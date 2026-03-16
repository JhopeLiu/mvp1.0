import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
