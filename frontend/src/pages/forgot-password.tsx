import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import useFormStyles from "@reddit/frontend/styles/formStyles";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const formStyle = useFormStyles();
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailError, setEmailError] = useState();
  const [, forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await forgotPassword({ email: recoveryEmail });
    setComplete(true);
  };

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <Navbar />
      <Container>
        <Box maxWidth="40%" mx="auto">
          {complete ? (
            <Box>
              If an account with that mail exists, we've sent you a mail with
              the instructions to recover your account
            </Box>
          ) : (
            <form
              className={formStyle.form}
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <FormControl className={formStyle.formField} fullWidth>
                <TextField
                  value={recoveryEmail}
                  onChange={e => {
                    setRecoveryEmail(e.target.value);
                  }}
                  label="Email"
                  variant="outlined"
                  color="secondary"
                  required
                />
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Send Recovery Link
              </Button>
            </form>
          )}
        </Box>
      </Container>
    </>
  );
};
export default withUrqlClient(createUrqlClient)(ForgotPassword);
