import React from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Link from "next/link";
import { useCurrentUserQuery, useLogoutMutation } from "generated/graphql";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import { isServer } from "@reddit/frontend/utils/isServer";

interface NavbarProps {}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    title: {
      flexGrow: 1,
      cursor: "pointer"
    }
  })
);

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "$ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""'
      }
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0
      }
    }
  })
)(Badge);

const Navbar: React.FC<NavbarProps> = ({}) => {
  const style = useStyles();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching: userFetching }] = useCurrentUserQuery({
    pause: isServer()
  });
  let body = null;

  const handleLogout = () => {
    logout();
  };

  if (userFetching) {
    body = <div>Loading</div>;
  } else if (!data?.me) {
    body = (
      <>
        <Link href="/register">
          <Button color="inherit">Register</Button>
        </Link>
        <Link href="/login">
          <Button color="inherit">Login</Button>
        </Link>
      </>
    );
  } else {
    body = (
      <>
        <StyledBadge
          onClick={handleLogout}
          overlap="circle"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          variant="dot"
        >
          <Avatar>{data?.me.username.charAt(0).toUpperCase()}</Avatar>
        </StyledBadge>
      </>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={style.menuButton}
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
        <Link href="/">
          <Typography variant="h6" className={style.title}>
            Reddit Clone
          </Typography>
        </Link>
        {body}
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
