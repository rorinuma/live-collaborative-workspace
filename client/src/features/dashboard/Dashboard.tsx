import styles from "./Dashboard.module.scss";
import { CgProfile } from "react-icons/cg";
import { IoIosNotifications } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { useGetProfile } from "../profile/queries";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import { useClickOutside } from "@/utils/click";
import { useGetUserWorkspaces } from "../workspaces/queries";
import Loading from "@/components/Loading/Loading";

const Dashboard = () => {
  const { data: user } = useGetProfile();
  const [profileMenuVisible, setProfileMenuVisible] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: workspaces, isLoading, error } = useGetUserWorkspaces();

  const closeMenu = useCallback(() => setProfileMenuVisible(false), []);
  useClickOutside(profileMenuRef, closeMenu);

  let workspacesNodes;

  if (workspaces) {
    workspacesNodes = workspaces.map((workspace) => (
      <div key={workspace.id}>
        <div>{workspace.id}</div>
      </div>
    ));
  } else if (isLoading) {
    workspacesNodes = <Loading />;
  } else if (error) {
    workspacesNodes = <div>Failed to load workspaces: {error.message}</div>;
  } else {
    workspacesNodes = <Link to="/">create a workspace!</Link>;
  }

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
            <div ref={profileMenuRef}>
              <button onClick={() => setProfileMenuVisible((prev) => !prev)}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="profile-picture" />
                ) : (
                  <CgProfile />
                )}
              </button>
              {profileMenuVisible && (
                <div className={styles.profilePopUp}>
                  <Link to="/profile">Profile</Link>
                  <Link to="/settings">Settings</Link>
                  <Link to="/logout">Log Out</Link>
                </div>
              )}
            </div>
            <div>
              <button>
                <IoIosNotifications />
              </button>
              <div></div>
            </div>
          </div>
        </header>

        <main>
          <article className={styles.activity}>
            <h1>Recent Activity</h1>
            <div className={styles.activityContent}></div>
          </article>
          <article className={styles.workspaces}>{workspacesNodes}</article>
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
