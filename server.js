require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

app.set("view engine", "ejs")

app.engine('ejs', require('ejs').__express)

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/execute/:district/:request", (req, res) => {
    console.log(req.ip)
    async function main() {
        const token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?${token}?oauth_callback=https://schoologyweb.netlify.app/view`)
    }
    main()
})

app.get("/view/:request", (req, res) => {
    console.log(req)
})

app.listen("3000")