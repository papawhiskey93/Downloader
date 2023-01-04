'use strict';

const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(bodyparser.urlencoded({extended : false}))
app.use(bodyparser.json())


const route = require('./api/route')
route(app)
let config = require('config')
const port = config.server.port

const downloader = require('./service/downloader')


downloader.InitializeLogin(0).then((result) => {
    const server = app.listen(port , (err) => {
        if(err){
            console.log(`Unable to initialize app, ERROR : ${err}`)
        }
        else{
            console.log(`app listening on http://${server.address().address}:${server.address().port}`)
        }
    })
}).catch((error) => {
    console.log(`Unable to initialize app, ERROR : ${error}`)
})













// const https = require('https')

// async function post(url, data) {
//   const dataString = JSON.stringify(data)

//   const options = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Content-Length': dataString.length,
//     },
//     timeout: 100000, // in ms
//   }

//   return new Promise((resolve, reject) => {
//     const req = https.request(url, options, (res) => {
//       if (res.statusCode < 200 || res.statusCode > 299) {
//         return reject(new Error(`HTTP status code ${res.statusCode}`))
//       }

//       const body = []
//       res.on('data', (chunk) => body.push(chunk))
//       res.on('end', () => {
//         const resString = Buffer.concat(body).toString()
//         resolve(resString)
//       })
//     })

//     req.on('error', (err) => {
//       reject(err)
//     })

//     req.on('timeout', () => {
//       req.destroy()
//       reject(new Error('Request time out'))
//     })

//     req.write(dataString)
//     req.end()
//   })
// }


// let url = 'https://www.devconnect2nse.com/extranet-api/login/1.0'

// let data = {
//     "memberCode" : "NEV05",
//     "loginId" : "apiUser",
//     "password" : "jcv7i2LEbHEuzseVGlr3xA=="
// };

// const res = post(url, data)
