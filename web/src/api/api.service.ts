import { useAxios } from "@vueuse/integrations/useAxios";
import { IMovieData } from "../interfaces/movies";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

const authHeader = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const useGet = (url: string, opts = { immediate: true }) => {
  return useAxios(url, { method: "GET" }, { immediate: opts.immediate });
};

export const usePostServer = (
  endpoint: string,
  { data = {}, immediate = false, token = "" } = {},
) => {
  return useAxios(
    `${SERVER_BASE_URL}/${endpoint}`,
    {
      method: "POST",
      headers: authHeader(token),
      data,
    },
    { immediate },
  );
};

export const useGetServer = (endpoint: string, { immediate = false, token = "" } = {}) => {
  return useAxios(
    `${SERVER_BASE_URL}/${endpoint}`,
    {
      method: "GET",
      headers: authHeader(token),
    },
    { immediate },
  );
};

export const getUserBookmarks = async (token: string) => {
  const { data } = await useGetServer("bookmarks", { immediate: true, token });
  return data.value?.bookmarks;
};

export const postToggleBookmark = (movieData: IMovieData | undefined, token: string) => {
  return usePostServer("bookmarks/toggle", {
    immediate: false,
    token,
    data: movieData,
  });
};

export const postToggleBookmarkAsync = (token: string) => {
  const { isLoading, execute, response } = useAxios();

  return {
    isLoading,
    response,
    execute: (data: IMovieData) =>
      execute(`${SERVER_BASE_URL}/bookmarks/toggle`, {
        method: "POST",
        headers: authHeader(token),
        data,
      }),
  };
};
