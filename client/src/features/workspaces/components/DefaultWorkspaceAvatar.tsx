import styles from "./DefaultWorkspaceAvatar.module.scss";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
};

const DefaultWorkspaceAvatar = ({
  name,
  stylingReverse,
}: {
  name: string;
  stylingReverse?: boolean;
}) => {
  const initials = getInitials(name);

  return (
    <div className={stylingReverse ? styles.initialsReversed : styles.initials}>
      {initials || "upload"}
    </div>
  );
};

export default DefaultWorkspaceAvatar;
