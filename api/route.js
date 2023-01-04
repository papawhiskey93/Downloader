'use strict'
const controller = require('./controller')

module.exports = (app) => {
    app.route('/Download').post(controller.DownloadHandler)
    app.route('/DownloadStatus').post(controller.DownloadStatusHandler)
}

