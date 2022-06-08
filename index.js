require("dotenv").config()
const SchoologyAPI = require("schoologyapi")
const express = require("express")
const app = express()
const path = require("path")
const SchoologyWeb = new SchoologyAPI(process.env.key, process.env.secret)

let token
let district
let final

app.use(express.static(__dirname + '/public'))
app.set("views", path.resolve(__dirname, "views"))
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.redirect("https://schoologyapi.web.app")
})

app.get("/execute/:district", (req, res) => {
    async function main() {
        district = req.params.district
        token = await SchoologyWeb.createRequestToken()
        res.redirect(`https://${req.params.district}.schoology.com/oauth/authorize?oauth_token=${SchoologyWeb.parseRequestToken(token).finalKey}&oauth_callback=schoologyweb.vercel.app/auth?request=${req.query.request}`)
    }
    main()
})

app.get("/auth", (req, res) => {
    async function main() {
        if (token == undefined) {
            res.send("Oh no, an error! This was probably caused by the serverless function timing out, or the OAuth flow being incomplete. If this issue persists, feel free to create an issue on the GitHub.")
        } else {
            final = await SchoologyWeb.getAccessToken(token)
            const response = await SchoologyWeb.clientRequest(`${req.query.request}&start=0&limit=200`, final)
            try {
                const requestData = JSON.parse(response)
                if (requestData.update) {
                    const uid = requestData.update[0].uid
                    const user = JSON.parse(await SchoologyWeb.request(`/users/${uid}`))
                    const name = user.name_display
                    const nextURL = `https://schoologyweb.vercel.app/url`
                    const prevURL = `https://schoologyweb.vercel.app/url`
                    res.render("userUpdates", { requestData, name, nextURL, prevURL })
                } else if (requestData.primary_email) {
                    res.render("userInfo", { requestData })
                }
            } catch {
                res.send("Oh nose, an error has occurred! If this issue persists, please open an issue in the GitHub!")
            }
        }
    }
    main()
})

app.get("/url", (req, res) => {
    res.send("Unfortunately I didn't finish page switching if you sign in with Schoology OAuth. You can switch pages if you sign in with your API credentials.")
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
        if (req.params[0] == "profile") {
            res.redirect(`https://schoologyweb.vercel.app/request/${req.params.key}/${req.params.secret}/users/${temp.uid}/`)
        } else if (req.params[0] == "updates") {
            res.redirect(`https://schoologyweb.vercel.app/request/${req.params.key}/${req.params.secret}/users/${temp.uid}/updates&start=0&limit=200`)
        }
    }
    main()
})

app.listen("80")