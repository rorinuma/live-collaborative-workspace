import { FaLongArrowAltLeft } from "react-icons/fa";
import styles from "./SignUp.module.scss";
import { useNavigate } from "react-router";
import { useMemo, useRef, useState } from "react";
import { SignUpFormValues, signupSchema } from "@/schemas/authSchemas";
import { z } from "zod";
import { RegisterUser } from "@/types/authTypes";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<SignUpFormValues>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormValues, string>>
  >({});
  const [serverResponse, setServerResponse] = useState({
    error: "",
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const handleArrowClick = () => {
    navigate("/");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (field: keyof SignUpFormValues) => {
    try {
      signupSchema.parse({ ...formValues, [field]: formValues[field] });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors as Partial<
          Record<keyof SignUpFormValues, string[]>
        >;
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field]?.[0] }));
      }
    }
  };

  const isDisabled = useMemo(() => {
    const isEmpty = Object.values(formValues).some(
      (value) => value.trim() == "",
    );
    if (isEmpty) {
      return true;
    }

    const result = signupSchema.safeParse(formValues);
    return !result.success;
  }, [formValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous errors and server response before submission
    setErrors({});
    setServerResponse({ error: "", message: "" });

    try {
      signupSchema.parse(formValues);
      setErrors({});

      const user: RegisterUser = {
        email: formValues.email,
        username: formValues.username,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      };

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const response = await axios.post(`${apiBaseUrl}/auth/register`, user);

      setServerResponse({
        error: "",
        message: response.data.message,
      });

      if (response.status === 201) {
        formRef.current?.reset();

        // artificial delay for development
        if (import.meta.env.MODE === "development") {
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.stack);
        setServerResponse({
          error: err.response?.data?.error || "Server error...",
          message: "",
        });
      } else if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors as Partial<
          Record<keyof SignUpFormValues, string[]>
        >;
        setErrors({
          email: fieldErrors.email?.[0],
          username: fieldErrors.username?.[0],
          password: fieldErrors.password?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
        });
      } else {
        console.error("Unexpected error: ", err);
      }
    }
  };

  return (
    <main className={styles.container}>
      <form
        className={styles.contentContainer}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        {(serverResponse.error || serverResponse.message) && (
          <div className={styles.serverMessageContainer}>
            <div
              className={serverResponse.error ? styles.error : styles.success}
            >
              {serverResponse.error
                ? serverResponse.error
                : serverResponse.message}
            </div>
          </div>
        )}
        <button
          type="button"
          className={styles.arrowBtn}
          onClick={handleArrowClick}
        >
          <FaLongArrowAltLeft className={styles.arrow} />
        </button>
        <div>
          <h1>login page!!! hahaha!!</h1>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Email</span>
            <input
              name="email"
              className={styles.inputField}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
            />
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </label>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Username</span>
            <input
              name="username"
              className={styles.inputField}
              onChange={handleChange}
              onBlur={() => handleBlur("username")}
            />
            {errors.username && (
              <div className={styles.error}>{errors.username}</div>
            )}
          </label>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Password</span>
            <input
              name="password"
              className={styles.inputField}
              type="password"
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
            />
            {errors.password && (
              <div className={styles.error}>{errors.password}</div>
            )}
          </label>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Confirm password</span>
            <input
              name="confirmPassword"
              className={styles.inputField}
              type="password"
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
            />
            {errors.confirmPassword && (
              <div className={styles.error}>{errors.confirmPassword}</div>
            )}
          </label>
        </div>
        <button className={styles.signUpBtn} disabled={isDisabled}>
          sign up
        </button>
      </form>
    </main>
  );
};

export default SignUp;
