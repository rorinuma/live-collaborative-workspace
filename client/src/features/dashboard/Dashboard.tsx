import styles from "./Dashboard.module.scss";
import { CgProfile } from "react-icons/cg";
import { IoIosNotifications } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { useGetProfile } from "../profile/queries";

const Dashboard = () => {
  const { data: user } = useGetProfile();

  return (
    <div className={styles.dashboard}>
      <nav></nav>
      <section>
        <header>
          <div className={styles.headerLeft}>
            <input placeholder="Search" />
            <button>
              <AiOutlineSearch />
            </button>
          </div>
          <div className={styles.headerRight}>
            <div>
              <button>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="profile-picture" />
                ) : (
                  <CgProfile />
                )}
              </button>
            </div>
            <div>
              <button>
                <IoIosNotifications />
              </button>
            </div>
          </div>
        </header>

        <main>
          <article></article>
          <article></article>
          <article></article>
          <article></article>
          <article></article>
          <article></article>
        </main>
      </section>
    </div>
  );
};

export default Dashboard;
