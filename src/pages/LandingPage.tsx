import Login from "../components/Login";
import { useContext, useEffect } from "react";
import { getCode } from "../App";
import { StateContext } from "../api/ContextProvider";
import { Center, Stack, Text } from "@mantine/core";

export let code: string | null;
export const setCode = (newCode: string | null) => {
  code = newCode;
};

const LandingPage = () => {
  const context = useContext(StateContext);
  useEffect(() => {
    context.setCurrentPage("landing");
    context.setShowHeader(false);
    if (getCode() !== null) {
      setCode(getCode());
      context.navigate.current("/loading");
    }
  }, []);

  return (
    <Stack mt="calc(50vh - 60px - 2rem)" align="center" justify="center">
      <Text className="title">Welcome to YSPM</Text>
      <Login />
    </Stack>
  );
};

export default LandingPage;
