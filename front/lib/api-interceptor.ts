import { AxiosInstance } from "axios";
import { getSession } from "./auth";

const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const accessToken = await getSession()
        if (accessToken) {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
      } catch (error) {
        console.error("Error in request interceptor:", error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

};

export async function initAxios(axiosInstance: AxiosInstance) {
  setupInterceptors(axiosInstance);
}
