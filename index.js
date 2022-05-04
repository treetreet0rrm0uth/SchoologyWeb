require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const path = require("path")
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

app.use(express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "views"))
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/execute/:district/:request", (req, res) => {
    console.log(req.ip)
    async function main() {
        const token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?${token}?oauth_callback=https://schoologyweb.vercel.app/view`)
    }
    main()
})

app.get("/view", (req, res) => {
    res.send(req.ip)
    console.log(req)
    console.log(req.ip)
})

app.listen("3000")