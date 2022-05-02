require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const serverless = require("serverless-http")
const ejs = require("ejs")
const app = express()
const router = express.Router()
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

app.set("view engine", "ejs")

app.engine('ejs', require('ejs').__express);

router.get("/", (req, res) => {
    res.render("index")
})

router.get("/execute/:district/:request", (req, res) => {
    async function main() {
        const token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?${token}?oauth_callback=https://schoologyweb.netlify.app/view`)
    }
    console.log(req.ip)
    main()
})

router.get("/view/:request", (req, res) => {
    console.log(req)
})

app.use("/", router)

module.exports.handler = serverless(app)