<script setup lang="ts">
import {
  BookmarkIcon as BookmarkIconOutline,
  ArrowCircleLeftIcon,
  DotsHorizontalIcon,
} from "@heroicons/vue/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/vue/solid";
import { StarIcon } from "@heroicons/vue/solid";
import { useRoute, useRouter } from "vue-router";

import LoadingScreen from "@/components/LoadingScreen.vue";
import FooterBar from "@/components/FooterBar.vue";
import ModalAlert from "@/components/ModalAlert.vue";

import { postToggleBookmarkAsync, useGetTMDB } from "../api";
import { useStore } from "../store";
import { computed, ref } from "@vue/reactivity";

const route = useRoute();
const router = useRouter();

const store = useStore();
store.dispatch("fetchBookmarks");

const sessionToken = store.getters.sessionToken;
const posterBaseUrl = store.getters.posterUrlTMDB;
const backdropBaseUrl = store.getters.backdropUrlTMDB;

const tmdbId = route.params.id;

const { isLoading, data } = useGetTMDB(`movie/${tmdbId}`);

const movieInfo = computed(() => {
  return {
    posterUrl: `${posterBaseUrl}${data.value?.poster_path}`,
    backdropUrl: `${backdropBaseUrl}${data.value?.backdrop_path}`,
    title: data.value?.title,
    voteAverage: data.value?.vote_average.toFixed(1),
    genres: data.value?.genres?.map(({ name }: { name: string }) => name),
    overview: data.value?.overview,
    releaseDate: data.value?.release_date,
    posterPath: data.value?.poster_path,
    genreIds: data.value?.genres,
    status: data.value?.status,
    rateCount: data.value?.vote_count,
    duration: `${data.value?.runtime} minutes`,
    tagline: data.value?.tagline,
  };
});

const bookmarks = computed(() => store.getters.bookmarks);

const isBookmarked = computed(() => {
  const wasBookmarked = bookmarks.value?.some(({ id_tmdb }: any) => +tmdbId === id_tmdb);
  return (wasBookmarked || response.value?.status === 201) && response.value?.status !== 204;
});

const { isLoading: isBookmarkLoading, execute, response } = postToggleBookmarkAsync(sessionToken);

const showSignInModal = ref(false);

const clickBookmark = () => {
  if (!sessionToken) return (showSignInModal.value = true);
  if (isBookmarkLoading.value) return;

  execute({
    ...movieInfo.value,
    genreIds: movieInfo.value?.genreIds?.map((genre: any) => genre.id),
    id_tmdb: +tmdbId,
  });
};
</script>

<template>
  <LoadingScreen v-if="isLoading || !movieInfo.backdropUrl" />
  <div v-else>
    <header class="flex justify-between py-4 px-4 w-full text-light citems-center">
      <ArrowCircleLeftIcon @click="$router.go(-1)" class="w-7" />
      <h1 class="font-bold">Detail</h1>
      <DotsHorizontalIcon class="w-8" v-if="isBookmarkLoading" />
      <template v-else>
        <BookmarkIconSolid
          v-if="isBookmarked"
          @click="clickBookmark"
          class="w-8 cursor-pointer text-secondary"
        />
        <BookmarkIconOutline
          v-else
          @click="clickBookmark"
          class="w-8 cursor-pointer text-inactive"
        />
      </template>
    </header>
    <div class="relative">
      <img
        :src="movieInfo.backdropUrl"
        class="rounded-b-3xl shadow-xl shadow-gray-900"
        alt="backdrop"
      />
      <div class="flex">
        <img
          :src="movieInfo.posterUrl"
          class="absolute left-10 w-28 rounded-3xl shadow-xl bottom-[-4rem] shadow-gray-900"
          alt="poster"
        />
        <h1 class="absolute left-40 m-4 text-2xl font-bold text-light">{{ movieInfo.title }}</h1>
      </div>
    </div>
    <main class="mx-10">
      <div class="flex gap-6 items-center mx-4 mt-20">
        <div class="flex flex-col items-center text-secondary">
          <StarIcon class="w-8" />
          <h4 class="text-sm">{{ movieInfo.voteAverage }}</h4>
        </div>
        <div class="flex overflow-x-auto gap-2 w-full rounded-3xl">
          <p
            v-for="genre in movieInfo.genres"
            class="flex items-center p-1 px-3 text-sm whitespace-nowrap rounded-3xl shadow-sm bg-main-700 text-light shadow-gray-900"
          >
            {{ genre }}
          </p>
        </div>
      </div>
      <div class="mt-8 text-light">
        <div class="my-4">
          <h1 class="my-2 text-lg font-bold">About movie</h1>
          <div class="w-28 h-1 bg-gray-700 rounded-3xl text-light" />
        </div>
        <div class="flex flex-col">
          <p>{{ movieInfo.overview }}</p>
          <div class="flex justify-end w-full">
            <h3 class="mx-10">{{ movieInfo.tagline }}</h3>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 my-6">
          <div>
            <h1 class="font-bold">Release date:</h1>
            <h2 class="mx-1 text-sm">{{ movieInfo.releaseDate }}</h2>
          </div>
          <div>
            <h1 class="font-bold">Status:</h1>
            <h2 class="mx-1 text-sm">{{ movieInfo.status }}</h2>
          </div>
          <div>
            <h1 class="font-bold">Average rating:</h1>
            <h2 class="mx-1 text-sm">{{ movieInfo.voteAverage }}</h2>
          </div>
          <div>
            <h1 class="font-bold">Rate count:</h1>
            <h2 class="mx-1 text-sm">{{ movieInfo.rateCount }}</h2>
          </div>
          <div>
            <h1 class="font-bold">Duration:</h1>
            <h2 class="mx-1 text-sm">{{ movieInfo.duration }}</h2>
          </div>
        </div>
      </div>
    </main>
  </div>
  <FooterBar />

  <ModalAlert
    v-if="showSignInModal"
    title="Login required"
    content="You must be logged in to set Bookmarks"
    buttonText="Login"
    @close-modal-button="router.push('/signin')"
    @close-modal-x="showSignInModal = false"
  />
</template>
