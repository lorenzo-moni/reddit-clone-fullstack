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
import { useRegisterMutation } from "generated/graphql";
import { toErrorMap } from "@reddit/frontend/utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "@reddit/frontend/utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Navbar from "@reddit/frontend/components/Navbar";
import useFormStyles from "@reddit/frontend/styles/formStyles";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  const formStyle = useFormStyles();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    const response = await register({ options: { username, password, email } });

    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
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
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                }}
                label="Email"
                variant="outlined"
                color="secondary"
                required
                error={!!errors?.email}
              />
              <Typography variant="caption" color="error">
                {errors?.email}
              </Typography>
            </FormControl>
            <FormControl className={formStyle.formField} fullWidth>
              <TextField
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                }}
                label="Username"
                variant="outlined"
                color="secondary"
                required
                error={!!errors?.username}
              />
              <Typography variant="caption" color="error">
                {errors?.username}
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
              Register
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
};
export default withUrqlClient(createUrqlClient)(Register);
