import { Container } from "@material-ui/core";
import React from "react";
import Navbar from "./Navbar";

interface layoutProps {
  children: NonNullable<React.ReactNode>;
}

const Layout: React.FC<layoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container>{children}</Container>
    </>
  );
};
export default Layout;
