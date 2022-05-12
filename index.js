require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const path = require("path")
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)
let token

app.use(express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "views"))
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/", (req, res) => {
    res.redirect("https://schoologyapi.web.app")
})

app.get("/execute/:district/:request", (req, res) => {
    console.log(req.ip)
    async function main() {
        token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?${token}?oauth_callback=https://schoologyweb.vercel.app/view`)
    }
    main()
})

app.get("/view", (req, res) => {
    if(token == undefined) {
        res.send("oh nose! an error in my 1000% perfect code!!! please tell me if this happens, and i will attempt to fix it yay!!! discord: tree tree t0rr m0uth#5165")
        return
    }
    async function main() {
        await SchoologyWeb.getAccessToken(token)
        const final = SchoologyWeb.parseRequestToken(token)
        console.log(final.finalKey)
        console.log(final.finalSecret)
        const client = new SchoologyAPI(process.env.key, process.env.secret)
        await client.createRequestToken().then(console.log)
    }
    main()
})

app.listen("3000")