import "../css/dashboard.scss";
import Logout from "../components/Logout";
import {
  Box,
  Center,
  Flex,
  Group,
  Loader,
  SimpleGrid,
  Space,
  Text,
} from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import UnfollowButton from "../components/UnfollowButton";
import {
  playlistsType,
  playlistType,
  tokenType,
  tracksType,
  userInfoType,
} from "../api/SpotifyApiClientTypes";
import CreatePlaylistButton from "../components/CreatePlaylistButton";
import SearchBar from "../components/SearchBar";
import FollowButton from "../components/FollowButton";
import {
  generatePlaylistKey,
  inPlaylists,
  replacer,
  savePlaylistsToFiles,
} from "../api/misc/HelperFunctions";
import GenreTestButton from "../components/GenreTestButton";
import BackButton from "../components/BackButton";
import Row from "../components/Row";
import ShowTracksButton from "../components/ShowTracksButton";
import GenreSubscriber from "../components/GenreSubscriber";
import PlaylistSubscriber from "../components/PlaylistSubscriber";
import TopPlaylistGenres from "../components/TopPlaylistGenres";
import UpdateAllButton from "../components/UpdateAllButton";
import { useNavigate } from "react-router-dom";
import {
  genreMasterList,
  getAllTrackGenres,
  getAllTracks,
  getAuthenticatedUserInfo,
  getPlaylists,
  getToken,
  getTracks,
} from "../api/SpotifyApiClientSide";
import { useLastfmQuery, useSpotifyQuery } from "../api/QueryApi";

export let token: tokenType | undefined | null;
export const setToken = (tokenValue: tokenType | undefined | null) => {
  token = tokenValue;
};
export let userInfo: userInfoType | undefined | null;
export let loadingAllTracks: boolean = false;

const Dashboard = () => {
  const navigate = useRef(useNavigate());
  const selectedPlaylistRef = useRef<playlistType>();
  const [getSelectedTrack, setSelectedTrack] = useState<tracksType>();
  const [infoIndex, setInfoIndex] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingP, setLoadingP] = useState(0);
  const [isLoadingT, setLoadingT] = useState(0);

  const playlistsQ = useRef<playlistsType>(undefined);
  const tracksQ = useRef<playlistType | undefined>(undefined);

  useEffect(() => {
    const start = async () => {
      setLoading(true);

      const tokenData = (await useSpotifyQuery(getToken, 0)) as
        | tokenType
        | undefined
        | null;
      if (tokenData !== undefined && tokenData !== null) {
        setToken(tokenData);
        const userData = (await useSpotifyQuery(
          getAuthenticatedUserInfo,
          0
        )) as userInfoType | undefined | null;
        if (userData !== undefined && userData !== null) {
          userInfo = userData;

          setLoading(false);
          setLoadingP((prev) => prev + 1);

          playlistsQ.current = (await useSpotifyQuery(
            getPlaylists,
            0
          )) as playlistsType;
          await useSpotifyQuery(getAllTracks, 0);
          await useLastfmQuery(getAllTrackGenres, 0);

          setLoadingP((prev) => prev - 1);
        } else userInfo = null;
      } else setToken(null);

      setLoading(false);
    };

    start();
  }, []);

  useEffect(() => {
    if (token === null || userInfo === null) navigate.current("/");
  }, [token, userInfo]);

  /**
   *
   */
  const setSelectedP = useCallback(
    async (selected: playlistType | undefined) => {
      if (selected === undefined || isLoadingT) return;
      selectedPlaylistRef.current = selected;
      setInfoIndex(0);
      setLoadingT((prev) => prev + 1);

      tracksQ.current = await useSpotifyQuery(
        getTracks,
        0,
        selectedPlaylistRef.current
      );
      if (
        userInfo !== undefined &&
        userInfo !== null &&
        playlistsQ.current !== undefined
      )
        await savePlaylistsToFiles(userInfo, playlistsQ.current);

      setLoadingT((prev) => prev - 1);
    },
    [isLoadingT]
  );

  /**
   *
   */
  const setSelectedT = useCallback((track: tracksType) => {
    setSelectedTrack(track);
    setInfoIndex(2);
  }, []);

  const isFollowed = useCallback(() => {
    if (
      selectedPlaylistRef.current !== undefined &&
      playlistsQ.current !== undefined
    ) {
      return playlistsQ.current.list.has(
        generatePlaylistKey(selectedPlaylistRef.current)
      );
    } else return false;
  }, [selectedPlaylistRef.current, playlistsQ.current]);

  const isOwned = useCallback(() => {
    if (
      selectedPlaylistRef.current !== undefined &&
      userInfo !== undefined &&
      userInfo !== null &&
      selectedPlaylistRef.current.owner === userInfo.display_name
    )
      return true;
    else return false;
  }, [selectedPlaylistRef.current, userInfo]);

  /**
   * Display list of playlists
   * @returns
   */
  const displayPlaylists = () => {
    if (isLoadingP)
      return (
        <Center h="100%" className="loading">
          <Loader color="green" size="sm" variant="bars" />
        </Center>
      );
    if (playlistsQ.current !== undefined) {
      const dynamicList: JSX.Element[] = [];
      let index = 0;
      for (const playlist of playlistsQ.current.list.values()) {
        dynamicList.push(
          <Box
            className="not-button"
            id={playlist.id}
            key={index++}
            onClick={() => setSelectedP(playlist)}
          >
            {index + 1}
            {". "}
            {playlist.name}
          </Box>
        );
      }
      if (dynamicList.length > 0)
        return (
          <SimpleGrid miw={"max-content"} cols={1} verticalSpacing={0}>
            {dynamicList}
          </SimpleGrid>
        );
      else
        return (
          <Center h="100%">
            <Text className="text">No Playlists</Text>
          </Center>
        );
    }
  };

  /**
   * Display list of tracks
   * @returns
   */
  const displayInfo = () => {
    if (isLoadingT)
      return (
        <Center h="100%" className="loading">
          <Loader color="green" size="sm" variant="bars" />
        </Center>
      );
    if (infoIndex === 0 && selectedPlaylistRef.current !== undefined) {
      return (
        <SimpleGrid
          h="100%"
          mih="max-content"
          miw="fit-content"
          cols={1}
          verticalSpacing={0}
        >
          <Box className="info-card">
            <Row label={"Name:"} value={selectedPlaylistRef.current.name} />
            <Space h="md" />
            <Row
              label={"Owned By:"}
              value={selectedPlaylistRef.current.owner}
            />
            <Space h="md" />
            <Flex wrap="wrap" gap="sm">
              <Row label={"Songs:"} value={selectedPlaylistRef.current.total} />
              <ShowTracksButton setInfoIndex={setInfoIndex} />
            </Flex>
            <Space h="xs" />
            <Row label={"Top Genres:"} value={null} />
            <TopPlaylistGenres
              selectedPlaylist={selectedPlaylistRef}
              isFollowed={isFollowed}
            />
            <Space h="xs" />
            <Group spacing={0}>
              <Row label={"Subscribed Genres:"} value={null} />
              <GenreSubscriber
                selectedPlaylist={selectedPlaylistRef}
                isFollowed={isFollowed}
                isOwned={isOwned}
              />
            </Group>
            <Space h="md" />
            <Group spacing={0}>
              <Row label={"Subscribed Playlists:"} value={null} />
              <PlaylistSubscriber
                playlists={playlistsQ}
                selectedPlaylist={selectedPlaylistRef}
                isFollowed={isFollowed}
                isOwned={isOwned}
              />
            </Group>
          </Box>
        </SimpleGrid>
      );
    } else if (
      infoIndex === 1 &&
      selectedPlaylistRef.current?.tracks !== undefined
    ) {
      const dynamicList: JSX.Element[] = [];
      let index = 0;
      for (const track of selectedPlaylistRef.current.tracks.values()) {
        dynamicList.push(
          <Box
            className="not-button"
            id={track.id}
            key={index++}
            onClick={() => {
              setSelectedT(track);
            }}
          >
            {index + 1}
            {". "}
            {track.name}
          </Box>
        );
      }
      if (dynamicList.length > 0)
        return (
          <SimpleGrid miw={"max-content"} cols={1} verticalSpacing={0}>
            {dynamicList}
          </SimpleGrid>
        );
      else
        return (
          <Center h="100%">
            <Text className="text">No Tracks</Text>
          </Center>
        );
    }
    if (infoIndex === 2 && getSelectedTrack !== undefined) {
      return (
        <Box className="info-card">
          <Row label={"Name:"} value={getSelectedTrack.name} />
          <Space h="md" />
          <Row label={"Artists:"} value={getSelectedTrack.artists.join(", ")} />
          <Space h="md" />
          <Row label={"Album:"} value={getSelectedTrack.album} />
          <Space h="md" />
          <Row
            label={"Genres:"}
            value={Array.from(getSelectedTrack.genres).join(", ")}
          />
          <Space h="md" />
          <Row label={"Playlists:"} value={inPlaylists(getSelectedTrack)} />
        </Box>
      );
    }
  };

  const displayPlaylistsLabel = () => {
    const loading = playlistsQ.current === undefined || isLoadingP;
    const number = loading ? "" : playlistsQ.current?.total;
    const label = playlistsQ.current?.total === 1 ? "Playlist" : "Playlists";
    return (
      <Text className="text">
        {"Your"} {number} {label}
      </Text>
    );
  };

  const displayInfoLabel = () => {
    const loading = selectedPlaylistRef.current === undefined || isLoadingT;
    let label: string;
    switch (infoIndex) {
      case 0:
        label = "Playlist Info";
        break;
      case 1:
        label = "Playlist Songs";
        break;
      case 2:
        label = "Track Info";
        break;
      default:
        label = "";
    }
    const title = loading ? "" : label;
    return <Text className="text">{title}</Text>;
  };

  const displayUserName = () => {
    if (userInfo !== undefined && userInfo !== null) {
      if (userInfo.display_name !== null) return ": " + userInfo.display_name;
    }
    return "";
  };

  /**
   * Decides whether to display the follow or unfollow button
   */
  const displayFollowOrUnfollow = () => {
    let decider = isFollowed();
    if (decider)
      return (
        <UnfollowButton
          playlists={playlistsQ}
          playlist={selectedPlaylistRef}
          setSelected={setSelectedP}
          setLoading={setLoadingP}
        />
      );
    else
      return (
        <FollowButton
          playlists={playlistsQ}
          playlist={selectedPlaylistRef}
          setSelected={setSelectedP}
          setLoading={setLoadingP}
        />
      );
  };

  if (isLoading) {
    return (
      <div className="background center loading">
        <Loader color="green" size="lg" variant="bars" />
      </div>
    );
  } else {
    return (
      <div className="background start">
        <Flex
          my="xl"
          gap="xl"
          justify="center"
          align="center"
          direction="row"
          wrap="nowrap"
        >
          <Center>
            <p className="title column-element">YSPM{displayUserName()}</p>
          </Center>
          <SearchBar setSelectedP={setSelectedP} setSelectedT={setSelectedT} />
          <Logout />
          <GenreTestButton />
        </Flex>

        <div className="listDisplayArea">
          {displayPlaylistsLabel()}
          {displayInfoLabel()}
          <div id="playlistsDisplay" className="list">
            {displayPlaylists()}
          </div>
          <div id="infoDisplay" className="list">
            {displayInfo()}
          </div>
          <Flex
            align="center"
            justify="space-evenly"
            h="100%"
            mt="lg"
            wrap="nowrap"
          >
            <CreatePlaylistButton
              playlists={playlistsQ}
              setSelected={setSelectedP}
              setLoading={setLoadingP}
            />
            <UpdateAllButton
              selectedPlaylist={selectedPlaylistRef}
              playlists={playlistsQ}
              setSelected={setSelectedP}
              setLoading={setLoadingT}
            />
          </Flex>
          <Flex
            align="center"
            justify="space-evenly"
            h="100%"
            mt="lg"
            wrap="nowrap"
          >
            <BackButton infoIndex={infoIndex} setInfoIndex={setInfoIndex} />
            {displayFollowOrUnfollow()}
          </Flex>
        </div>
      </div>
    );
  }
};

export default Dashboard;
