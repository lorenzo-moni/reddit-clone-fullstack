import { createMuiTheme } from "@material-ui/core";
import { purple } from "@material-ui/core/colors";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#FF4500"
    },
    secondary: {
      main: "#5F99CF"
    }
  },
  typography: {
    fontFamily: "Quicksand",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700
  }
});

export default theme;
