import React, { useState } from "react";
import {
  makeStyles,
  TextField,
  Button,
  Typography,
  FormControl,
  Box,
  Container
} from "@material-ui/core";

import { useLoginMutation } from "generated/graphql";
import { toErrorMap } from "@reddit/frontend/utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "@reddit/frontend/utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Navbar from "@reddit/frontend/components/Navbar";
import Link from "next/link";
import useFormStyles from "@reddit/frontend/styles/formStyles";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  const formStyle = useFormStyles();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    const response = await login({ usernameOrEmail, password });

    if (response.data?.login.errors) {
      setErrors(toErrorMap(response.data.login.errors));
    } else if (response.data?.login.user) {
      router.push("/");
    }
  };

  return (
    <>
      <Navbar />
      <Container>
        <Box maxWidth="40%" mx="auto">
          <form
            className={formStyle.form}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <FormControl className={formStyle.formField} fullWidth>
              <TextField
                value={usernameOrEmail}
                onChange={e => {
                  setUsernameOrEmail(e.target.value);
                }}
                label="Username or Email"
                variant="outlined"
                color="secondary"
                required
                error={!!errors?.usernameOrEmail}
              />
              <Typography variant="caption" color="error">
                {errors?.usernameOrEmail}
              </Typography>
            </FormControl>

            <FormControl className={formStyle.formField} fullWidth>
              <TextField
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                }}
                label="Password"
                type="password"
                variant="outlined"
                color="secondary"
                required
                error={!!errors?.password}
              />
              <Typography variant="caption" color="error">
                {errors?.password}
              </Typography>
            </FormControl>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Login
            </Button>
            <Box style={{ marginTop: 10 }}>
              <Link href="/forgot-password">Forgot your Password?</Link>
            </Box>
          </form>
        </Box>
      </Container>
    </>
  );
};
export default withUrqlClient(createUrqlClient)(Login);
