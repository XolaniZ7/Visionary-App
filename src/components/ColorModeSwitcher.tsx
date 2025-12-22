import { ButtonProps, IconButton, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "phosphor-react";

/**
 * A button that will toggle dark or light mode
 */
const ColorModeSwitcher = (props: ButtonProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Color Mode Switcher"
      variant="ghost"
      icon={
        colorMode === "light" ? <Moon size={32} weight="bold" /> : <Sun size={32} weight="bold" />
      }
      {...props}
      onClick={toggleColorMode}
    />
  );
};

export default ColorModeSwitcher;
