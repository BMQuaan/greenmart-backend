import express,{Express} from "express";
import dotenv from "dotenv";
import * as database from "./config/database"
import clientV1Routes from "./api/v1/routes/client/index.route";
import bodyParser from"body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors"
import adminV1Routes from "./api/v1/routes/admin/index.route";
dotenv.config();
database.connect();
const app:Express = express();
const port:string | number = process.env.PORT || 3000;

// var corsOptions = {
//   origin: "http://example.com",
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
// app.use(cors(corsOptions));
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3002", "http://103.155.161.125:3001", "http://103.155.161.125:3002"], // Chấp nhận cả 3001 và 3002
  credentials: true, // Cho phép gửi cookie
}));
 
// parse application/json
app.use(bodyParser.json())
app.use(cookieParser()); 
// Routes Ver 1
clientV1Routes(app);
adminV1Routes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
