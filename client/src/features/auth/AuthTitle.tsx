import { Link } from "react-router";
import styles from "./AuthTitle.module.scss";

const AuthTitle = () => {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div>
          to use this awesome thingy you must login or you shall not pass!!!
        </div>
        <Link to="/login">
          <button>login</button>
        </Link>
        <Link to="/signup" className={styles.wavy}>
          already have an account? sign up
        </Link>
      </div>
    </main>
  );
};

export default AuthTitle;
