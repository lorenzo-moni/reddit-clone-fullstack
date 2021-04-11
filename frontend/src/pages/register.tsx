import React, { useState } from "react";
import {
  makeStyles,
  TextField,
  Button,
  Typography,
  FormControl,
  Box
} from "@material-ui/core";
import { useRegisterMutation } from "generated/graphql";
import { toErrorMap } from "@reddit/frontend/utils/toErrorMap";
import { useRouter } from "next/router";

const useStyles = makeStyles(theme => ({
  formField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  form: { width: "100%" }
}));

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  const style = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors(null);
    const response = await register({ username, password });

    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
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
          Register
        </Button>
      </form>
    </Box>
  );
};
export default Register;
