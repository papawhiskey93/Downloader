'use strict'
const downloader = require('../service/downloader')
const async = require('async')
const { v4 : uuidv4 } = require('uuid') 
let DownloadStatusArray = []
let DownloadStatusArrayObject = {}
const Enum = require('enum')

const DownloadStatus = new Enum ({
    'DOWNLOAD_SUCCESS' : 900,
    'DOWNLOAD_FAILURE' : 901
})

var controller = {

    DownloadHandler: (req , res) => {
        let reqBody = req.body
        downloader.HttpDownload(reqBody,0).then((result) => {
            let uuidData = uuidv4()
            DownloadStatusArray.push(uuidData)
            DownloadStatusArrayObject[uuidData] = `${reqBody.localPath}${reqBody.filename}`
            res.status(200).send({ "uuid" : uuidData,  "result" : result })
        }).catch((error) => {
            res.status(500).send({ "error" : error })
        })
    }, //DownloadHandler

    DownloadStatusHandler: (req ,res) => {
        let reqBody = req.body
        if(reqBody.uuid && DownloadStatusArray.includes(reqBody.uuid))
        {
            res.status(200).send({ "downloadPath" :  `${DownloadStatusArrayObject[reqBody.uuid]}` ,"downloadStatus" : DownloadStatus.DOWNLOAD_SUCCESS.value , "result" : "file downloaded" })
        
        }
        else
        {
            res.status(500).send({ "downloadStatus" : DownloadStatus.DOWNLOAD_FAILURE.value ,"result" : "file not downloaded" })
        }
    }
} //controller

module.exports = controller