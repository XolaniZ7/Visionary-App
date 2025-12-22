import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { signIn } from "auth-astro/client";
import z from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginForm = () => {
  const { form, errors } = useForm<z.infer<typeof schema>>({
    onSubmit: async (values) => {
      const response = await signIn("credentials", {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        email: values.email,
        password: values.password,
        callbackUrl: `${window.location.origin}/app`,
        redirect: false,
      });

      const data = await response?.json();
      console.log({ data });
      if ((data.url as string)?.includes("error")) {
        console.log("ERROR");
        throw Error();
      }
    },
    onError: () => {
      return {
        password:
          "There was an issue logging in. Please check your username and password. Also ensure your email has been verified",
      };
    },
    extend: [validator({ schema })],
  });

  return (
    <form ref={form} className="w-full flex flex-col justify-center gap-3">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          id="email"
          name="email"
          type="text"
          placeholder="John Doe"
          className="input input-bordered w-full"
        />
        <label className="label">
          {errors().email && <span className="label-text-alt text-error">*{errors().email}</span>}
        </label>
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          name="password"
          type="password"
          placeholder="********"
          className="input input-bordered w-full"
        />
        {errors().password && (
          <span className="label-text-alt text-error">*{errors().password}</span>
        )}
      </div>
      <div className="flex flex-col w-full my-8 gap-2">
        <button className="btn btn-primary w-full">Submit</button>
        <button
          onClick={() => {
            signIn("google");
          }}
          id="google-login-button"
          type="button"
          className="btn btn-outline"
        >
          <svg
            className="mr-2 -ml-1 w-4 h-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Sign in with Google
        </button>
        <div className="flex justify-between">
          <a href="/join" className="link">
            Register
          </a>
          <a href="/forgot-password" className="link">
            Forgot Password
          </a>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
