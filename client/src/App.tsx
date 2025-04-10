import { Routes, Route, Navigate, useNavigate } from "react-router";
import "./App.css";
import Loading from "./components/Loading/Loading";
import SignUp from "./features/auth/SignUp";
import AuthTitle from "./features/auth/AuthTitle";
import Login from "./features/auth/Login";
import Workspace from "./features/workspaces/Workspace";
import { useAppDispatch } from "./app/hooks";
import WorkspaceCreation from "./features/workspaces/WorkspaceCreation";
import { useEffect } from "react";
import { userAuthorized } from "./features/profile/profileSlice";
import { useGetProfile } from "./features/profile/queries";
import Dashboard from "./features/dashboard/Dashboard";
import { useRefreshToken } from "./features/auth/queries";

const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    mutate: refresh,
    isPending: isRefreshing,
    isError: refreshFailed,
    error: refreshError,
  } = useRefreshToken();

  const {
    data: user,
    isSuccess,
    isLoading: profileLoading,
    error: profileError,
    isError: profileIsError,
  } = useGetProfile({
    enabled: !isRefreshing && !refreshFailed,
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (user) {
      dispatch(userAuthorized(user));
      //   const lastWorkspace = localStorage.getItem("lastWorkspaceId");
      //   if (lastWorkspace) {
      //     navigate(`/workspace/${lastWorkspace}`);
      //   }
    }
  }, [user, dispatch, navigate]);

  if (isRefreshing || profileLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isSuccess ? <WorkspaceCreation /> : <AuthTitle />}
      />

      {!isSuccess && (
        <>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </>
      )}

      {isSuccess && (
        <>
          <Route
            path="/workspace/:currentWorkspaceId"
            element={<Workspace />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loading" element={<Loading />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
