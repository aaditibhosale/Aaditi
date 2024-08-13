const express = require("express");
const cors = require("cors");
const utils = require("./utils");
const config = require("./config");
const jwt = require("jsonwebtoken");

const port = config.PORT_NO;

console.log(port);

// create a new express application
const app = express();
app.use(cors());
app.use(express.json());

// return version
app.get("/version", (req, res) => res.send(utils.createSuccessResponse("1.0")));

// add Routes
const userRoutes = require("./routes/user");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const coordinates = require("./routes/coordinates")
const staff = require("./routes/staff")


app.use("/user", userRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes)
app.use("/coordinates",coordinates)
app.use("/staff",staff)

app.listen(port, () => console.log(`App listening on port ${port}!`));
