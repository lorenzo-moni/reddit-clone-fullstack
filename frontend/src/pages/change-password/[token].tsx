import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Alert from "@material-ui/lab/Alert";
import { useChangePasswordMutation } from "generated/graphql";
import Navbar from "@reddit/frontend/components/Navbar";
import { NextPage } from "next";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import theme from "@reddit/frontend/styles/theme";
import Head from "next/head";
import { useRouter } from "next/router";
import { toErrorMap } from "@reddit/frontend/utils/toErrorMap";
import { createUrqlClient } from "@reddit/frontend/utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Link from "next/link";

const useStyles = makeStyles(theme => ({
  formField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  form: { width: "100%" },
  alert: { marginTop: theme.spacing(2), textTransform: "capitalize" }
}));

const ChangePassword: NextPage<any> = ({ token }) => {
  const style = useStyles();
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();

  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>();
  const [tokenError, setTokenError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    const response = await changePassword({ newPassword, token });
    if (response.data?.changePassword.errors) {
      const errorMap = toErrorMap(response.data.changePassword.errors);
      if ("token" in errorMap) {
        setTokenError(errorMap.token);
      }
      setErrors(errorMap);
    } else if (response.data?.changePassword.user) {
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />

      <Container>
        {tokenError && (
          <Alert severity="error" className={style.alert}>
            {tokenError}. <Link href="/forgot-password">Try again</Link>
          </Alert>
        )}
        <Box maxWidth="40%" mx="auto">
          <form
            className={style.form}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <FormControl className={style.formField} fullWidth>
              <TextField
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                }}
                label="New Password"
                variant="outlined"
                color="secondary"
                type="password"
                required
                error={!!errors?.newPassword}
              />
              <Typography variant="caption" color="error">
                {errors?.newPassword}
              </Typography>
            </FormControl>

            <Button variant="contained" color="primary" type="submit" fullWidth>
              Change Password
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return { token: query.token as string };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
