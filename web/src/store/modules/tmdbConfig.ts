import { ActionContext } from "vuex";
import { useGet } from "../../api";
import { getTMDBConfig, getTMDBGenres } from "../../api/tmdb.service";

import { IGenreMapping, IImagesConfig, ITMDBState } from "../../interfaces/vuex";

export default {
  state: () => ({
    imagesConfig: {
      baseImgUrlTMDB: [],
      posterSizesTMDB: [],
      backdropSizesTMDB: [],
    },
    genresMappings: [] as IGenreMapping[],
  }),

  getters: {
    baseImgUrlTMDB: (state: ITMDBState) => state.imagesConfig.baseImgUrlTMDB,
    posterSizesTMDB: (state: ITMDBState) => state.imagesConfig.posterSizesTMDB,
    backdropSizesTMDB: (state: ITMDBState) => state.imagesConfig.backdropSizesTMDB,

    genresMap(state: ITMDBState) {
      const map = new Map<string, string>();
      state.genresMappings?.map(({ id, name }) => map.set(id, name));
      return map;
    },

    posterUrlTMDB: (state: ITMDBState) => {
      const base = state.imagesConfig.baseImgUrlTMDB;
      const posterSizes = state.imagesConfig.posterSizesTMDB;
      return `${base}${posterSizes.at(-1)}`;
    },

    backdropUrlTMDB: (state: ITMDBState) => {
      const base = state.imagesConfig.baseImgUrlTMDB;
      const backdropSizes = state.imagesConfig.backdropSizesTMDB;
      return `${base}${backdropSizes.at(-1)}`;
    },
  },

  mutations: {
    setTMDBImgConfig(state: ITMDBState, payload: IImagesConfig) {
      state.imagesConfig.baseImgUrlTMDB = payload.baseImgUrlTMDB;
      state.imagesConfig.posterSizesTMDB = payload.posterSizesTMDB;
      state.imagesConfig.backdropSizesTMDB = payload.backdropSizesTMDB;
    },
    setTMDBGenresMappings(state: ITMDBState, genres: Array<IGenreMapping>) {
      state.genresMappings = genres;
    },
  },

  actions: {
    async configTMDB(context: ActionContext<ITMDBState, {}>) {
      if (
        !context.getters.baseImgUrlTMDB ||
        !context.getters.posterSizesTMDB?.length ||
        !context.getters.backdropSizesTMDB?.length
      ) {
        context.commit("setTMDBImgConfig", await getTMDBConfig());
      }
      context.commit("setTMDBGenresMappings", await getTMDBGenres());
    },
    async useGetPoster(context: ActionContext<ITMDBState, {}>) {
      return (endpoint: string) => useGet(`${context.getters.posterUrlTMDB}/${endpoint}`);
    },
  },
};
