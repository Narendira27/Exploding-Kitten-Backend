const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const cors = require('cors')

const DbPath = path.join(__dirname, "sql.db");

let db

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: DbPath,
            driver: sqlite3.Database
        });
        app.listen(54321, () => console.log("Server Running"))
    } catch (e) {
        console.log(`Error : ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

const app = express()
app.use(cors())
app.use(express.json())


app.post('/user', async (req, res) => {
    const body = req.body

    const getInfoQuery = `SELECT * FROM GAME WHERE name ="${body.username.toLowerCase()}"`

    const InfoResponse = await db.all(getInfoQuery)

    if (InfoResponse.length <= 0) {
        const dbQuery = `INSERT INTO GAME (name, highestscore, lastscore ) VALUES('${body.username.toLowerCase()}',0,0)`
        const dbResponse = await db.run(dbQuery)
        return res.json({ msg: "User Created" })
    }

    res.json({ msg: "User Already Exists", data: InfoResponse })
})

app.get('/leaderboard', async (req, res) => {
    const getLeaderBoardQuery = `SELECT name,highestscore FROM GAME ORDER BY highestscore DESC`
    const DbResponse = await db.all(getLeaderBoardQuery)
    res.status(200).json({ leaderBoard: DbResponse })
})


app.put('/finalscore', async (req, res) => {

    const body = req.body

    const getScoreQuery = `SELECT highestscore FROM GAME WHERE NAME='${body.username.toLowerCase()}'`

    const getScoreResponse = await db.get(getScoreQuery)

    if ((!getScoreResponse) || (body.score === undefined)) {
        return res.status(400).json({ "msg": "error" })
    }

    if (body.score > getScoreResponse.highestscore) {
        const updateScoreQuery = `UPDATE GAME SET highestscore = '${body.score}' where name = '${body.username.toLowerCase()}'`
        const updateScoreResponse = await db.run(updateScoreQuery)
        console.log(updateScoreResponse)
        return res.json({ "msg": "score updated" })
    }

    res.json({ "msg": "previous score is higher" })
})


app.put('/lastscore', async (req, res) => {

    const body = req.body

    if ((body.score === undefined)) {
        return res.status(400).json({ "msg": "error" })
    }

    const updateScoreQuery = `UPDATE GAME SET lastscore = '${body.score}' where name = '${body.username.toLowerCase()}'`
    await db.run(updateScoreQuery)
    res.json({ "msg": "score updated" })
})