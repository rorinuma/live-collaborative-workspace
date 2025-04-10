import styles from "./WorkspaceCreation.module.scss";
import { IoCheckmarkOutline, IoCloseSharp } from "react-icons/io5";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";
import api from "@/utils/api";
import axios from "axios";
import DefaultWorkspaceAvatar from "./components/DefaultWorkspaceAvatar";
import CropperModal from "@/components/CropperModal/CropperModal";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Workspace, WorkspaceApiResponse } from "@/types/workspaceTypes";
import { useAppDispatch } from "@/app/hooks";
import { setCurrentWorkspace } from "./workspaceSlice";
import { normalizeWorkspace } from "@/utils/workspaces";

interface WorkspaceCreationFormElements extends HTMLFormControlsCollection {
  imageInput: HTMLInputElement;
  nameInput: HTMLInputElement;
  descriptionInput: HTMLTextAreaElement;
}

interface WorkspaceCreationFormElement extends HTMLFormElement {
  readonly elements: WorkspaceCreationFormElements;
}

interface InviteLinkFormElements extends HTMLFormControlsCollection {
  inviteLinkInput: HTMLInputElement;
}

interface InviteLinkFormElement extends HTMLFormElement {
  readonly elements: InviteLinkFormElements;
}

const WorkspaceCreation = () => {
  // server submit results
  const [
    createWorkspaceSubmitResultMessage,
    setCreateWorkspaceSubmitResultMessage,
  ] = useState({ error: "", message: "" });
  const [textAreaLength, setTextAreaLength] = useState<number>(0);
  const [inviteLinkSubmitResultMessage, setInviteLinkSubmitResultMessage] =
    useState({
      error: "",
      message: "",
    });
  const [joinWorkspaceMessage, setJoinWorkspaceMessage] = useState({
    error: "",
    message: "",
  });
  // modal states
  const [workspaceCreationModalActive, setWorkspaceCreationModalActive] =
    useState<boolean>(false);
  const workspaceCreationModalContentContainerRef =
    useRef<HTMLFormElement>(null);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [showWorkspaceOverviewModal, setShowWorkspaceOverviewModal] =
    useState<boolean>(false);
  // image logic
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  // invite link logic
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const workspaceOverviewContentRef = useRef<HTMLDivElement>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<Workspace | null>(null);

  // modal
  const handleCreateWorkspaceButtonClick = () => {
    setWorkspaceCreationModalActive(true);
  };

  const handleWorkspaceCreationModalClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (
      !workspaceCreationModalContentContainerRef.current?.contains(
        event.target as Node,
      )
    ) {
      setWorkspaceCreationModalActive(false);
      setCreateWorkspaceSubmitResultMessage({ error: "", message: "" });
      setTextAreaLength(0);
    }
  };

  const handleWorkspaceCreationFormSubmit = async (
    event: React.FormEvent<WorkspaceCreationFormElement>,
  ) => {
    event.preventDefault();

    const form = event.currentTarget;
    const { nameInput, descriptionInput, imageInput } = form.elements;

    const name = nameInput.value;
    const description = descriptionInput.value;
    const imageFile = uploadedImage || imageInput.files?.[0];

    if (!name) {
      setCreateWorkspaceSubmitResultMessage({
        message: "",
        error: "Workspace must have a name",
      });
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) {
      formData.append("workspaceImage", imageFile);
    }

    try {
      const response = await api.post("/workspaces/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.reset();
      imageReset();

      setCreateWorkspaceSubmitResultMessage({
        message: response.data.message,
        error: "",
      });
      navigate(`/workspace/${response.data.workspace.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setCreateWorkspaceSubmitResultMessage({
          message: "",
          error: error.response?.data.error,
        });
      }
      console.error(error);
    }
  };

  // go back button
  const handleModalArrowClick = () => {
    setWorkspaceCreationModalActive(false);
    setCreateWorkspaceSubmitResultMessage({ error: "", message: "" });
  };

  const handleTextAreaLengthChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setTextAreaLength(event.target.value.length);
  };

  const imagePreview = uploadedImage
    ? URL.createObjectURL(uploadedImage)
    : null;

  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageToCrop(url);
      setShowCropModal(true);
    }
  };

  const imageReset = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropDone = (blob: Blob) => {
    setUploadedImage(new File([blob], "cropped.png", { type: "image/png" }));
  };

  // invite link
  const handleInviteLinkSubmit = async (
    event: React.FormEvent<InviteLinkFormElement>,
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    const { inviteLinkInput } = form.elements;

    const inviteLink = inviteLinkInput.value;

    if (inviteLink.trim() === "") {
      return setInviteLinkSubmitResultMessage({
        message: "",
        error: "The field must not be empty!",
      });
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(inviteLink)) {
      return setInviteLinkSubmitResultMessage({
        message: "",
        error: "Invalid invite link",
      });
    }
    try {
      const response = await api.get<WorkspaceApiResponse>(
        `/workspaces/invite-verify?inviteToken=${inviteLink}`,
      );

      setShowWorkspaceOverviewModal(true);
      setWorkspaceInfo(normalizeWorkspace(response.data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "an error occured in handleInviteLinkSubmit: ",
          error.stack,
        );
        setInviteLinkSubmitResultMessage({
          message: "",
          error: error.response?.data?.error,
        });
      } else {
        console.error(
          "an unknown error occured in handleInviteLinkSubmit: ",
          error,
        );
        setInviteLinkSubmitResultMessage({
          message: "",
          error: "an unknown error occured",
        });
      }
    }
  };

  const handleOverviewClose = () => {
    setShowWorkspaceOverviewModal(false);
    setWorkspaceInfo(null);
    setJoinWorkspaceMessage({ error: "", message: "" });
  };

  const handleOverviewModalClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!workspaceOverviewContentRef.current?.contains(event.target as Node)) {
      handleOverviewClose();
    }
  };

  const handleJoinClick = async (inviteToken: string) => {
    try {
      const response = await api.post<WorkspaceApiResponse>(
        `/workspaces/join`,
        { inviteToken },
      );
      dispatch(setCurrentWorkspace(normalizeWorkspace(response.data)));
      setJoinWorkspaceMessage({ message: response.data.message, error: "" });
      navigate(`/workspaces/${response.data.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.stack);
        setJoinWorkspaceMessage({
          message: "",
          error: error.response?.data.error,
        });
      } else {
        console.error("error occured while trying to join the workspace");
        setJoinWorkspaceMessage({
          error: "an unknown error occured",
          message: "",
        });
      }
    }
  };

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.6 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.95 },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <section className={styles.container}>
        <form
          className={styles.contentContainer}
          onSubmit={handleInviteLinkSubmit}
        >
          <h2>workspace creation page!</h2>

          <p>create your own workspace</p>

          <div>
            <button
              type="button"
              className={styles.createWorkspaceButtonRedirect}
              onClick={handleCreateWorkspaceButtonClick}
            >
              create a workspace!
            </button>
          </div>

          <p>or join one with an invite link</p>

          <label>
            <div>
              <span>Invite Link: </span>
              {inviteLinkSubmitResultMessage.error ? (
                <span className={styles.submitError}>
                  {inviteLinkSubmitResultMessage.error}
                </span>
              ) : (
                <span className={styles.submitSuccess}>
                  {inviteLinkSubmitResultMessage.message}
                </span>
              )}
            </div>
            <div>
              <input name="inviteLinkInput" />
              <button>
                <IoCheckmarkOutline className={styles.submitIcon} />
              </button>
            </div>
          </label>
        </form>
      </section>

      {/* accept invite or not overlay */}
      {createPortal(
        <AnimatePresence>
          {showWorkspaceOverviewModal && workspaceInfo && (
            <motion.section
              className={styles.workspaceOverviewModal}
              onClick={handleOverviewModalClick}
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={styles.workspaceOverviewModalContent}
                ref={workspaceOverviewContentRef}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.15 }}
              >
                {(joinWorkspaceMessage.error || joinWorkspaceMessage.message) &&
                  (joinWorkspaceMessage.error ? (
                    <div className={styles.submitError}>
                      {joinWorkspaceMessage.error}
                    </div>
                  ) : (
                    <div className={styles.submitSuccess}>
                      {joinWorkspaceMessage.message}
                    </div>
                  ))}
                <h2>join this workspace?</h2>
                <button
                  type="button"
                  className={styles.overiewArrow}
                  onClick={handleOverviewClose}
                >
                  <FaLongArrowAltLeft className={styles.arrow} />
                </button>
                <div>
                  {workspaceInfo && workspaceInfo.imageUrl ? (
                    <img src={workspaceInfo.imageUrl} alt="workspace-image" />
                  ) : (
                    <DefaultWorkspaceAvatar
                      name={workspaceInfo.name}
                      stylingReverse={true}
                    />
                  )}
                </div>
                <div>{workspaceInfo?.name}</div>
                <div>{workspaceInfo?.memberCount} member!</div>
                <div>{workspaceInfo.description || "no description:("}</div>
                <div>creation date: {workspaceInfo?.createdAt}</div>
                <article className={styles.actions}>
                  <button type="button" onMouseDown={handleOverviewClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJoinClick(workspaceInfo.inviteToken)}
                  >
                    Join
                  </button>
                </article>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* workspace creation */}
      {createPortal(
        <AnimatePresence>
          {workspaceCreationModalActive && (
            <>
              <motion.section
                className={styles.workspaceCreationModal}
                onMouseDown={handleWorkspaceCreationModalClick}
                variants={overlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <motion.form
                  className={styles.workspaceCreationModalContentContainer}
                  ref={workspaceCreationModalContentContainerRef}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleWorkspaceCreationFormSubmit}
                  transition={{ duration: 0.15 }}
                >
                  {(createWorkspaceSubmitResultMessage.error ||
                    createWorkspaceSubmitResultMessage.message) &&
                    (createWorkspaceSubmitResultMessage.error ? (
                      <div className={styles.submitError}>
                        {createWorkspaceSubmitResultMessage.error}
                      </div>
                    ) : (
                      <div className={styles.submitSuccess}>
                        {createWorkspaceSubmitResultMessage.message}
                      </div>
                    ))}

                  <button
                    type="button"
                    className={styles.workspaceCreationArrow}
                    onClick={handleModalArrowClick}
                  >
                    <FaLongArrowAltLeft className={styles.arrow} />
                  </button>

                  <div className={styles.uploadImageContainer}>
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          alt="workspaceImage"
                          className={styles.workspaceImagePreview}
                          onClick={handleUploadImageClick}
                        />
                        <button type="button" onClick={imageReset}>
                          <IoCloseSharp />
                        </button>
                      </div>
                    ) : (
                      <div onClick={handleUploadImageClick}>
                        <DefaultWorkspaceAvatar name="" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    name="imageInput"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />

                  <label className={styles.workspaceNameLabel}>
                    Workspace Name
                    <input type="text" name="nameInput" />
                  </label>

                  <label>
                    <div className={styles.textAreaLabelContent}>
                      <span>Description</span>
                      {textAreaLength !== 0 && (
                        <span>{textAreaLength} / 100</span>
                      )}
                    </div>

                    <textarea
                      name="descriptionInput"
                      placeholder="optional"
                      maxLength={100}
                      onChange={handleTextAreaLengthChange}
                    />
                  </label>

                  <button
                    type="submit"
                    className={styles.createWorkspaceButton}
                  >
                    Create Workspace
                  </button>
                </motion.form>
              </motion.section>

              {showCropModal && imageToCrop && (
                <CropperModal
                  image={imageToCrop}
                  onClose={imageReset}
                  onCropDone={handleCropDone}
                />
              )}
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default WorkspaceCreation;
