import { useQuery } from "react-query";
import { token, userInfo } from "./Dashboard";
import {
  getToken,
  getPlaylists,
  getTracks,
  createPlaylist,
  unfollowPlaylist,
  getAllTracks,
  getAuthenticatedUserInfo
} from "./SpotifyApiClientSide";
import { playlistType, userInfoType } from "./SpotifyApiClientTypes";

let tracksFlag = false;
export const refetchTracks = () => {
  tracksFlag = true;
};
let createFlag = false;
export const refetchCreate = () => {
  createFlag = true;
};

// Gets access token
export const tokenQuery = () => useQuery("token", getToken);

// Gets authenticated user info
export const userQuery = () =>
  useQuery(["user", token?.accessToken], getAuthenticatedUserInfo, {
    enabled: token?.accessToken !== undefined
  });

// Gets playlist
export const playlistsQuery = () =>
  useQuery(["playlists", userInfo], getPlaylists, {
    enabled: userInfo !== undefined
  });

// Gets tracks
export const tracksQuery = (selectedPlaylist: playlistType | undefined) =>
  useQuery(
    ["tracks", selectedPlaylist, tracksFlag],
    async () => {
      const res = await getTracks(selectedPlaylist?.id);
      tracksFlag = false;
      return res;
    },
    { enabled: selectedPlaylist !== undefined && tracksFlag }
  );

// Gets all tracks
export const allTracksQuery = () =>
  useQuery("allTracks", getAllTracks, { enabled: false });

// Creates playlist with name
export const createQuery = (
  playlistName: string | undefined,
  setSelected: (selected: playlistType | undefined) => void
) =>
  useQuery(
    ["create", playlistName, createFlag],
    async () => {
      const res = await createPlaylist(playlistName);
      setSelected(res);
      createFlag = false;
      return res;
    },
    { enabled: playlistName !== "" && createFlag }
  );

// Unfollows currently selected playlist
export const unfollowQuery = (
  selectedPlaylist: playlistType | undefined,
  setSelected: (selected: playlistType | undefined) => void
) =>
  useQuery(
    ["unfollow", selectedPlaylist],
    async () => {
      const res = await unfollowPlaylist(selectedPlaylist?.id);
      setSelected(undefined);
      return res;
    },
    { enabled: false }
  );

/*
const { isFetching: addingToTimelessRadar, refetch: addToTimelessRadar } =
  useQuery(
    ["addToTimelessRadar"],
    () =>
      addPlaylistToPlaylist(
        playlists?.list.find(playlist => playlist.name === "Release Radar")?.id,
        playlists?.list.find(playlist => playlist.name === "Timeless Radar")?.id
      ),
    { enabled: false }
  );
*/