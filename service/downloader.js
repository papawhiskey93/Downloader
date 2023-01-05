let config = require('config')
const https = require('https')
const fs = require('fs')
const CryptoJS = require('crypto-js');

var downloader = {

    aesEncrypt(rawPassword) {
        // key received in the email
        const key = `${config.NSELoginData.key}`
        const cipher = CryptoJS.AES.encrypt(rawPassword, CryptoJS.enc.Base64.parse(key), {
            mode: CryptoJS.mode.ECB
        })
    
        return cipher.toString();
    },

    async InitializeLogin(failedLoginRequestCount) {
        return new Promise((resolve, reject) => {
            let url = config.NSELoginData.loginURL 
            // Provide the raw password here 
            // console.log(`Encryoted Password ${aesEncrypt('Abcd@12345678')}`)
            let loginData = {
                "memberCode": config.NSELoginData.memberCode,
                "loginId": config.NSELoginData.loginId,
                "password": `${downloader.aesEncrypt(`${config.NSELoginData.password}`)}`
            };
            
            const dataString = JSON.stringify(loginData)

            const loginOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': dataString.length,
                },
                timeout: 30000 // in ms
            }
            const req = https.request(url, loginOptions, (res) => {
                if (res.statusCode < 200 || res.statusCode > 299) {
                    return reject(new Error(`HTTP status code ${res.statusCode}`))
                }

                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    let resString = Buffer.concat(body).toString()
                    if(JSON.parse(resString).token){
                       config.NSELoginResponse = Object.assign(config.NSELoginResponse , JSON.parse(resString))
                       resolve(resString)
                    }
                    else{
                        setTimeout(() => {
                          ++failedLoginRequestCount
                          if(failedLoginRequestCount == config.maxLoginRetryCount){
                            reject(`Maximum retries exceed for NSE login`)
                          }else{
                            resolve(downloader.InitializeLogin(failedLoginRequestCount))
                          }
                        },config.requestTimeoutInMS)
                    }
                    
                })
            })

            req.on('error', (err) => {
                setTimeout(() => {
                    ++failedLoginRequestCount
                    if(failedLoginRequestCount == config.maxLoginRetryCount){
                      reject(`Maximum retries exceeded for NSE login with ERROR : ${err}`)
                    }else{
                      resolve(downloader.InitializeLogin(failedLoginRequestCount))
                    }
                  },config.requestTimeoutInMS) 
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })

            req.write(dataString)
            req.end()

        })
    }, //InitializeLogin

    async HttpDownload(reqBody , failedDownloadRequestCount) {
        return new Promise((resolve,reject) => {
            let downloadFileName = reqBody.filename
            let fileDownloadUrl = `${reqBody.uri}`
            const downloadOptions = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${config.NSELoginResponse.token}`
                }
            }
            let localDownloadPath = reqBody.localPath
            https.get(fileDownloadUrl , downloadOptions ,(response) => {
                switch(response.statusCode){
                    case 200:
                        const filePath = `${localDownloadPath}${downloadFileName}`
                        const fileSteam = fs.createWriteStream(filePath)
                        response.on('data' , (chunk) => {
                            // fileSteam.write(chunk)
                            fileSteam.write(chunk)
                        }).on('end',() => {
                            fileSteam.end();
                            resolve(`File Downloaded with StatusCode : ${response.statusCode}`)
                        })
                    break
                    case 401:
                        downloader.InitializeLogin(0).then((result) => {
                            resolve(downloader.HttpDownload(reqBody , 0))
                        }).catch((error) => {
                            reject(`Error occured for download with statusCode 401, Error: ${error}`)
                        })
                    break
                    default:
                        setTimeout(() => {
                            ++failedDownloadRequestCount
                            if(failedDownloadRequestCount == config.maxDownloadRetryCount){
                              reject(`Maximum retries exceeded for download `)
                            }else{
                              resolve(downloader.HttpDownload(reqBody,failedDownloadRequestCount))
                            }
                          },config.requestTimeoutInMS) 
                    break
                }
            })
        })
    }  //HttpDownload

} //downloader

module.exports = downloader
