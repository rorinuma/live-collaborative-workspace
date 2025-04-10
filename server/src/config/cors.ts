import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: [process.env.FRONTEND_PORT || "http://localhost:5173"],
  credentials: true,
};

export default corsOptions;
