import React, { useState } from "react";
import {
  makeStyles,
  TextField,
  Button,
  Typography,
  FormControl,
  Box
} from "@material-ui/core";

import { useLoginMutation } from "generated/graphql";
import { toErrorMap } from "@reddit/frontend/utils/toErrorMap";
import { useRouter } from "next/router";

const useStyles = makeStyles(theme => ({
  formField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  form: { width: "100%" }
}));

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  const style = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    const response = await login({ options: { username, password } });

    if (response.data?.login.errors) {
      setErrors(toErrorMap(response.data.login.errors));
    } else if (response.data?.login.user) {
      router.push("/");
    }
  };

  return (
    <Box maxWidth="40%" mx="auto">
      <form
        className={style.form}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <FormControl className={style.formField} fullWidth>
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

        <FormControl className={style.formField} fullWidth>
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
      </form>
    </Box>
  );
};
export default Login;
