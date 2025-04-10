import { useAppSelector } from "@/app/hooks";
import {} from "../workspaces/workspaceSlice";
import { useParams } from "react-router";
import { convertDate } from "@/utils/workspaces";
import styles from "./Workspace.module.scss";
import { getCurrentUser } from "../profile/profileSlice";
import { useGetCurrentWorkspace } from "./queries";
import Loading from "@/components/Loading/Loading";

const Workspace = () => {
  const { currentWorkspaceId } = useParams();
  const { username, accountCreationDate } = useAppSelector(getCurrentUser);
  const {
    data: workspace,
    error,
    isLoading,
  } = useGetCurrentWorkspace(currentWorkspaceId!);

  localStorage.setItem("lastWorkspaceId", currentWorkspaceId!);
  const convertedDate = convertDate(accountCreationDate);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div>{error.message}</div>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{ color: "white" }}>
      <div>{username}</div>
      <div>{convertedDate}</div>
      <div>{currentWorkspaceId}</div>
      <div>{workspace?.name}</div>
    </div>
  );
};

export default Workspace;
