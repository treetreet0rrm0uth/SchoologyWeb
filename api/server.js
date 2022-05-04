require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

app.set("view engine", "ejs")

app.engine('ejs', require('ejs').__express)

app.get("/api", (req, res) => {
    res.render("index")
})

app.get("/api/execute/:district/:request", (req, res) => {
    console.log(req.ip)
    async function main() {
        const token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?${token}?oauth_callback=https://schoologyweb.vercel.app/view`)
    }
    main()
})

app.get("/api/view", (req, res) => {
    res.send(req)
    res.send(req.ip)
    console.log(req)
    console.log(req.ip)
})

app.listen("3000")