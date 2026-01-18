import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export const useApiClient = () => {
  const { getToken } = useAuth();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_SERVER_URL,
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return api;
};
