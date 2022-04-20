const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user")


dotenv.config();
const app = express();

mongoose.connect(process.env.MONGODB_URL, ()=>{
    console.log("CONNECTED TO MONGO DB");
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//route
app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);



app.listen(8000, () => {
    console.log("server is running");
});

//authentication
//json web token jwt - xác thực người dùng như 1 cá chứng minh nhân dân để xác thực mỗi khi đăng nhập vào tránh trường hợp giả mạo người khác