import { extendTheme, useColorModeValue } from "@chakra-ui/react";

export const usePrimaryColorScheme = () => useColorModeValue("ocean", "fire")
export const usePrimaryColor = () => useColorModeValue("ocean.500", "fire.500")
import { withProse } from '@nikolovlazar/chakra-ui-prose'
import { baseTheme } from '@saas-ui/react'

const config = {
  semanticTokens: {
    colors: {
      primary: {
        default: "ocean.500",
        _dark: "fire.500",
      },
      primaryText: {
        default: "paper.400",
        _dark: "ocean.500",
      },
      primaryHighlight: {
        default: "ocean.300",
        _dark: "fire.700",
      },
      textMuted: {
        default: "gray.700",
        _dark: "whiteAlpha.700",
      },
      textDanger: {
        default: "red.500",
        _dark: "red.300",
      },
      inputBg: {
        default: "white",
        _dark: "ocean.300",
      },
      muted: {
        default: "gray.100",
        _dark: "whiteAlpha.300",
      },
      "bg.base": {
        default: "paper.500",
        _dark: "ocean.500",
      },
      "bg.one": {
        default: "paper.400",
        _dark: "ocean.400",
      },
      "bg.two": {
        default: "paper.700",
        _dark: "ocean.300",
      },
      "bg.three": {
        default: "white",
        _dark: "ocean.500",
      },
      "bg.card": {
        default: "paper.300",
        _dark: "ocean.300",
      }
    },
  },
  colors: {

    ocean: {
      DEFAULT: '#121B2E',
      50: '#25385F',
      100: '#23355A',
      200: '#1F2E4F',
      300: '#1B2844',
      400: '#162139',
      500: '#121B2E',
      600: '#0F1727',
      700: '#0C121F',
      800: '#090E18',
      900: '#070A11'
    },
    fire: {
      DEFAULT: '#ff980a',
      '50': '#fffaec',
      '100': '#fff4d3',
      '200': '#ffe5a5',
      '300': '#ffd16d',
      '400': '#ffb232',
      '500': '#ff980a',
      '600': '#ff8000',
      '700': '#cc5d02',
      '800': '#a1480b',
      '900': '#823d0c',
      '950': '#461d04',
    },
    paper: {
      50: "#ffffff",
      100: "#ffffff",
      200: "#ffffff",
      300: "#ffffff",
      400: "#fffdf8",
      500: "#f9f3ee",
      600: "#efe9e4",
      700: "#e5dfda",
      800: "#dbd5d0",
      900: "#d1cbc6",
    },
    gray: {
      50: "#f1f2f3",
      100: "#d8d8d8",
      200: "#bebebe",
      300: "#a4a4a4",
      400: "#898a8a",
      500: "#6f7071",
      600: "#575757",
      700: "#3e3e3e",
      800: "#252525",
      900: "#0c0c0e",
    },
  },
  config: {
    useSystemColorMode: false,
    customColorModeStorageName: "theme",
  },

  // styles: {
  //   global: {
  //     h2: {
  //       fontSize: '2xl',
  //       fontWeight: 'bold',
  //     },
  //     h3: {
  //       fontSize: 'lg'
  //     },
  //     h4: {
  //       fontSize: 'md'
  //     }
  //   }
  // }
};
export const theme = extendTheme(config, withProse({
  baseStyle: {
    p: {
      margin: 0
    },
    h1: {
      mt: 0,
      mb: 1
    },
    h2: {
      mt: 0,
      mb: 1
    },
    h3: {
      mt: 0,
      mb: 1
    },
    h4: {
      mt: 0,
      mb: 1
    },
    ol: {
      listStyle: "decimal"
    }
  }
}), baseTheme);
