
import express from "express"
const app = express();

app.use("/api/auth", authRoutes)
app.listen(5001, () => {
  console.log("server is runing on port 5001")
})
