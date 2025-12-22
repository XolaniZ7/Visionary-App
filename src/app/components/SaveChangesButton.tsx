import { Button, ButtonProps, Flex } from "@chakra-ui/react";
import { ArrowCircleRight } from "phosphor-react";
import React from "react";

import { usePrimaryColorScheme } from "../theme";

interface SaveChangesButtonProps extends ButtonProps {
  text?: string;
}

const SaveChangesButton = (props: SaveChangesButtonProps) => {
  const primaryColorScheme = usePrimaryColorScheme();
  return (
    <Flex justifyContent="flex-end">
      <Button
        type="submit"
        p={6}
        mt={2}
        colorScheme={primaryColorScheme}
        bg={"primary"}
        rightIcon={<ArrowCircleRight size={25} weight="fill" />}
        {...props}
      >
        {props.text || "Save Changes"}
      </Button>
    </Flex>
  );
};

export default SaveChangesButton;
