import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import conncectionDB from "./db/index.js";
import { app } from "./app.js";

const Port = process.env.PORT || 8000;
conncectionDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`server listen on Port ${Port}`);
    });
  })
  .catch((error) => console.log(`error in MONGO CONNECTION ${error}`));
