import { Button, Loader } from "@mantine/core";
import { useState } from "react";
import { getLimit, maxOffset } from "../api/ApiClientData";

type propType = {
  offset: React.MutableRefObject<number>;
  page: React.MutableRefObject<number>;
  total: React.MutableRefObject<number>;
  getResults: () => Promise<void>;
};

const LoadMoreGeneralButton = (props: propType) => {
  const [isLoading, setLoading] = useState(false);
  const loadMore = async () => {
    if (
      props.offset.current <= maxOffset &&
      props.offset.current < props.total.current
    ) {
      setLoading(true);
      props.page.current++;
      props.offset.current += getLimit;
      await props.getResults();
      console.log("offset", props.offset.current, "total", props.total.current);
      setLoading(false);
    }
  };
  if (isLoading) return <Loader my="sm" size="md" />;
  else
    return (
      <Button
        w="35%"
        miw="min-content"
        my="xs"
        variant="filled"
        disabled={props.offset.current + getLimit > maxOffset}
        radius="xl"
        size="md"
        onClick={async () => {
          await loadMore();
        }}
        styles={(theme) => ({
          root: {
            display:
              props.offset.current + getLimit > maxOffset ||
              props.offset.current + getLimit >= props.total.current
                ? "none"
                : "initial",
          },
        })}
      >
        Load More
      </Button>
    );
};

export default LoadMoreGeneralButton;
