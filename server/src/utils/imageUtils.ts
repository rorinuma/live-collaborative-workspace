export const convertImagePath = (image: string) => {
  return `${process.env.BACKEND_PATH}/uploads/${image}`;
};
