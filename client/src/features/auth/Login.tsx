import { useNavigate } from "react-router";
import styles from "./Login.module.scss";
import { FaLongArrowAltLeft } from "react-icons/fa";
import axios from "axios";
import { LoginUser } from "@/types/authTypes";
import { useRef, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { tokenReceived } from "./authSlice";

const Login = () => {
  const navigate = useNavigate();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [submitResultMessage, setSubmitResultMessage] = useState({
    error: "",
    message: "",
  });
  const dispatch = useAppDispatch();

  const handleArrowClick = () => {
    navigate("/");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      usernameInputRef.current!.value.trim() === "" ||
      passwordInputRef.current!.value.trim() === ""
    ) {
      setSubmitResultMessage({
        error: "Fields must not be empty",
        message: "",
      });
      return;
    }

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

      const loginInfo: LoginUser = {
        username: usernameInputRef.current!.value,
        password: passwordInputRef.current!.value,
      };

      const response = await axios.post(`${apiBaseUrl}/auth/login`, loginInfo, {
        withCredentials: true,
      });

      if (response.status === 200) {
        dispatch(tokenReceived(response.data.accessToken));
        setSubmitResultMessage({ error: "", message: response.data.message });

        // artifical delay for development mode
        if (import.meta.env.MODE === "development") {
          setTimeout(() => {
            navigate(0);
          }, 1500);
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitResultMessage({
          error: err?.response?.data.error,
          message: "",
        });
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.contentContainer} onSubmit={handleSubmit}>
        {(submitResultMessage.error || submitResultMessage.message) && (
          <div className={styles.serverMessageContainer}>
            <div
              className={
                submitResultMessage.error ? styles.error : styles.success
              }
            >
              {submitResultMessage.error
                ? submitResultMessage.error
                : submitResultMessage.message}
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
          <h1>sign up page hahahah!</h1>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Username</span>
            <input
              name="username"
              className={styles.inputField}
              ref={usernameInputRef}
            />
          </label>
        </div>
        <div>
          <label className={styles.inputFieldLabel}>
            <span className={styles.inputLabelName}>Password</span>
            <input
              name="password"
              className={styles.inputField}
              type="password"
              ref={passwordInputRef}
            />
          </label>
        </div>
        <button className={styles.signUpBtn}>login</button>
      </form>
    </div>
  );
};

export default Login;
