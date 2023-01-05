'use strict'
const downloader = require('../service/downloader')
const async = require('async')
const { v4: uuidv4 } = require('uuid')
let DownloadStatusArray = []
let DownloadStatusSuccessObject = {}
let DownloadResultObject = {}

const Enum = require('enum')

const DownloadStatus = new Enum({
    'DOWNLOAD_SUCCESS': 900,
    'DOWNLOAD_FAILURE': 901
})

var controller = {

    DownloadHandler: (req, res) => {
        let reqBody = req.body
        if (reqBody.uri && reqBody.filename && reqBody.uri.split(['filename='])[1] === `${reqBody.filename}`) {
            let uuidData = uuidv4()
            res.status(200).send({ "uuid": uuidData })
            downloader.HttpDownload(reqBody, 0).then((result) => {
                DownloadStatusArray.push(uuidData)
                DownloadStatusSuccessObject[uuidData] = `${reqBody.localPath}${reqBody.filename}`
                DownloadResultObject[uuidData] = `${result}`
                // res.status(200).send({ "uuid" : uuidData,  "result" : result })
            }).catch((error) => {
                DownloadResultObject[uuidData] = `${error}`
                // res.status(500).send({ "error" : error })
            })
        }
        else
        {
            res.status(500).send({ "message": `Filename mismatch!!!` })
        }

    }, //DownloadHandler

    DownloadStatusHandler: (req, res) => {
        let reqBody = req.body
        if (reqBody.uuid && DownloadStatusArray.includes(reqBody.uuid)) {
            res.status(200).send(
                {
                    "downloadPath": `${DownloadStatusSuccessObject[reqBody.uuid]}`,
                    "downloadStatus": DownloadStatus.DOWNLOAD_SUCCESS.value,
                    "message": `${DownloadResultObject[reqBody.uuid]}`,
                })

        }
        else {
            res.status(500).send(
                {
                    "downloadStatus": DownloadStatus.DOWNLOAD_FAILURE.value,
                    "message": `${DownloadResultObject[reqBody.uuid]}`

                })
        }
    }
} //controller

module.exports = controller