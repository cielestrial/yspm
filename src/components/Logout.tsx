import { Button } from "@mantine/core";
import { useContext } from "react";
import { setCode } from "../pages/LandingPage";
import { StateContext } from "../api/ContextProvider";

type propType = {
  height: string | number | undefined;
};

const Logout = (props: propType) => {
  const context = useContext(StateContext);

  return (
    <Button
      miw="7rem"
      h={props.height}
      compact
      variant="subtle"
      color="green"
      size="xl"
      component="a"
      onClick={async () => {
        setCode(null);
        context.setUserInfo(null);
        context.setToken(null);
        context.navigate.current("/");
      }}
    >
      Logout
    </Button>
  );
};

export default Logout;
