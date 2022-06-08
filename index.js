require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const path = require("path")
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

let token

app.use(express.static(__dirname + '/public'))
app.set("views", path.resolve(__dirname, "views"))
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.redirect("https://schoologyapi.web.app")
})

app.get("/execute/:district/", (req, res) => {
    async function main() {
        token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?oauth_token=${SchoologyWeb.parseRequestToken(token).finalKey}&oauth_callback=schoologyweb.vercel.app/auth`)
    }
    main()
})

app.get("/auth", (req, res) => {
    async function main() {
        const final = await SchoologyWeb.getAccessToken(token)
        const response = await SchoologyWeb.clientRequest("/messages/inbox", final)
        res.send(response)
    }
    main()
})

app.get("/request/:key/:secret/:realm/:id/*", (req, res) => {
    async function main() {
        const client = new SchoologyAPI(req.params.key, req.params.secret)
        const requestData = JSON.parse(await client.request(`/${req.params.realm}/${req.params.id}/${req.params[0]}/`))
        let url = req.protocol + '://' + req.get('host') + req.originalUrl
        if (req.params.realm == "users") {
            if (req.params[0] == "") {
                res.render("userInfo", { requestData })
            } else {
                const fetchName = JSON.parse(await client.request(`/${req.params.realm}/${req.params.id}/`))
                const name = fetchName.name_display
                let nextBoolean = new Boolean(true)
                let prevBoolean = new Boolean(false)
                let next = requestData.links.next
                let prev = requestData.links.prev
                let nextURL
                let prevURL
                if (req.params[0] == "updates&start=0&limit=200") {
                    url = url.slice(0, -17)
                } else if (req.params[0] == "updates&start=200&limit=200") {
                    url = url.slice(0, -19)
                }
                if (next != undefined) {
                    next = next.slice(-19)
                    nextBoolean = true
                    nextURL = url + next
                }
                if (prev != undefined) {
                    prev = prev.slice(-17)
                    prevBoolean = true
                    prevURL = url + prev
                }
                res.render("userUpdates", { requestData, name, nextURL, prevURL })
            }
        } else {
            res.send("Invalid URL!")
        }
    }
    main()
})

app.get("/self/:key/:secret/*", (req, res) => {
    async function main() {
        const client = new SchoologyAPI(req.params.key, req.params.secret)
        const temp = JSON.parse(await client.request("/users/me"))
        if(req.params[0] == "profile") {
            res.redirect(`https://schoologyweb.vercel.app/request/${req.params.key}/${req.params.secret}/users/${temp.uid}/`)
        }else if(req.params[0] == "updates") {
            res.redirect(`https://schoologyweb.vercel.app/request/${req.params.key}/${req.params.secret}/users/${temp.uid}/updates&start=0&limit=200`)
        }
    }
    main()
})

app.listen("80")