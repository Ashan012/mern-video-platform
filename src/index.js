import dotenv from "dotenv";
import conncectionDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ path: "./.env" });

const Port = process.env.PORT || 8000;

conncectionDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`server listen on Port ${Port}`);
    });
  })
  .catch((error) => console.log(`error in MONGO CONNECTION ${error}`));
