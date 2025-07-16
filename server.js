//import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiRouter.js";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


app.use("/api", apiRouter);
//app.all("*", (req, res) => {
   // res.status(404).json({ message: "Route not found" });
//});

//const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
