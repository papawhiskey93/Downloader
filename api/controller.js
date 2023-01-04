'use strict'
const downloader = require('../service/downloader')
const async = require('async')
const { v4 : uuidv4 } = require('uuid') 
let DownloadStatusArray = []
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
            res.status(200).send({ "uuid" : uuidData,  "result" : result })
        }).catch((error) => {
            res.status(500).send({ "error" : error })
        })
    }, //DownloadHandler

    DownloadStatusHandler: (req ,res) => {
        let reqBody = req.body
        if(DownloadStatusArray.includes(reqBody.uuid))
        {
            res.status(200).send({ "downloadStatus" : DownloadStatus.DOWNLOAD_SUCCESS , "result" : "file downloaded" })
        
        }
        else
        {
            res.status(500).send({ "downloadStatus" : DownloadStatus.DOWNLOAD_FAILURE ,"result" : "file not downloaded" })
        }
    }
} //controller

module.exports = controller