import Cropper, { Area } from "react-easy-crop";
import { useCallback, useState } from "react";
import { getCroppedImg } from "@/utils/cropImage";
import styles from "./CropperModal.module.scss";

const CropperModal = ({
  image,
  onClose,
  onCropDone,
}: {
  image: string;
  onClose: () => void;
  onCropDone: (blob: Blob) => void;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(image, croppedAreaPixels);
    onCropDone(blob);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.cropperContainer}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
