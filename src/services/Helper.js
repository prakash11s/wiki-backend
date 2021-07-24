const path = require('path')
const fs = require('fs')
const Response = require('../services/Response')
const Constants = require('../services/Constants')
const Jimp = require('jimp')
const moment = require('moment')
const {UserDeviceToken} = require('../models')
const {Op} = require('sequelize')

module.exports = {
    AppName: 'Odessey',
    forgotTemplate: 'forgotPassword',
    userForgotTemplate: 'userForgotPassword',
    newPasswordTemplate: 'newPassword',
    welcomeTemplate: 'welcomeMessage',
    emailVerificationMail: 'emailVerification',
    toUpperCase: (str) => {
        if (str.length > 0) {
            const newStr = str.toLowerCase()
                .replace(/_([a-z])/, (m) => m.toUpperCase())
                .replace(/_/, '')
            return str.charAt(0)
                .toUpperCase() + newStr.slice(1)
        }
        return ''
    },

    /**
     * @description This function use for create random number
     * @param length
     * @returns {*}
     */

    makeRandomNumber: (length) => {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    },

    /**
     * @description This function use for generating image link
     * @param folder
     * @param name
     * @returns {*}
     */

    mediaUrl: (folder, name) => {
        if (name && name !== '') {
            return `${process.env.API_URL}uploads/${folder}/${name}`
        }
        return ''
    },

    /**
     * @description This function use for create validation unique key
     * @param apiTag
     * @param error
     * @return {*}
     */
    validationMessageKey: (apiTag, error) => {
        let key = module.exports.toUpperCase(error.details[0].context.key)
        let type = error.details[0].type.split('.')
        type = module.exports.toUpperCase(type[1])
        key = apiTag + key + type
        return key
    },

    /**
     * @description This function use for Making Random Digit
     * @param apiTag
     * @param error
     * @return {*}
     */
    makeRandomDigit: (length) => {
        let result = ''
        const characters = '0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    },

    /**
     * @description This function use for Creating OTP
     * @param apiTag
     * @param error
     * @return {*}
     */
    sendOTP: (countryCode, mobile, otp) => {
        const mob = `${countryCode}${mobile}`
        return new Promise((resolve, reject) => {
            Twilio.messages
                .create({
                    body: `CMS COV-ID verification OTP : ${otp}`,
                    from: process.env.TWILIO_MOBILE,
                    to: mob
                })
                .then((message) => {
                    console.log(message.sid)
                    return resolve({
                        code: 200,
                        message: 'sent'
                    })
                }).catch((e) => {
                console.log(e)
                return resolve({
                    code: 400,
                    message: e
                })
            })
            return null
        })
    },

    /**
     * @description This function used for Image Validation
     * @param file
     * @param paths
     * @param filename
     * @return {*}
     */
    async imageValidation(req, res, image) {
        return new Promise((resolve, reject) => {
            const extension = image.type
            const imageExtArr = ['image/jpg', 'image/jpeg', 'image/png']
            if (image && (!imageExtArr.includes(extension))) {
                return Response.errorResponseWithoutData(res, res.__('imageInvalid'), Constants.BAD_REQUEST)
            }
            return resolve(true)
        })
    },

    /**
     * @description This function used for Image Size Validation
     * @param file
     * @param paths
     * @param filename
     * @return {*}
     */
    async imageSizeValidation(req, res, image) {
        return new Promise((resolve, reject) => {
            if (image > process.env.MAX_IMG_SIZE) {
                return Response.errorResponseWithoutData(res, res.__('LargeImage'), Constants.BAD_REQUEST)
            }
            return resolve(true)
        })
    },

    /**
     * @description This function use for uploading the file
     * @param file
     * @param paths
     * @param filename
     * @return {*}
     */
    async uploadImage(file, paths, filename) {
        return new Promise((resolve, reject) => {
            const fs = require('fs-extra')
            const tempPath = file.path
            const fileName = filename
            const newLocation = path.join(__dirname, '../../public/uploads') + '/' + paths + '/'
            if (!fs.existsSync(newLocation)) {
                // eslint-disable-next-line handle-callback-err
                fs.mkdirSync(newLocation, {recursive: true}, (err) => {
                })
            }
            fs.copy(tempPath, newLocation + fileName, (err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(fileName)
                }
            })
        })
    },

    uploadImageBase64: async (fileName, storagePath, req, res) =>
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async (resolve, reject) => {
            const base64 = req.fields.image
            const extension = base64.split(';')[0].split('/')[1]
            const decodedImage = Buffer.from(
                base64.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
            )
            const image = await Jimp.read(decodedImage)
            await image.quality(85)
            const newLocation =
                path.join(__dirname, '../../public/uploads') + '/' + storagePath + '/'
            if (!fs.existsSync(newLocation)) {
                fs.mkdirSync(newLocation, {recursive: true}, () => {
                })
            }
            await image
                .writeAsync(`${newLocation}/${fileName}`)
                .then((pres) => {
                    return resolve({
                        code: 200,
                        body: pres
                    })
                })
                .catch((e) => {
                    reject(e)
                    return Response.errorResponseData(
                        res,
                        res.__('somethingWentWrong'),
                        500
                    )
                })
        }),
    /**
     * @description This function use for removing Old Image.
     * @param file
     * @param paths
     * @param filename
     * @return {*}
     */
    removeOldImage: (file, storagePath, res) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(__dirname, '../../public/uploads') + '/' + storagePath + '/'
            fs.unlink(`${filePath}${file}`, function (error) {
                if (error) {
                    reject(error)
                }
                resolve(true)
            })
            return null
        })
    },

    dateTimeTimestamp: (date) => {
        return new Date(date).getTime() / 1000
    },


    dobToAge: (date) => {
        var dob = date
        var year = Number(dob.substr(0, 4))
        var month = Number(dob.substr(5, 2)) - 1
        var day = Number(dob.substr(8, 2))
        var today = new Date()
        var age_y = today.getFullYear() - year
        var age_m = today.getMonth() - month
        var age_d = today.getDate() - day
        /* if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) {
          age--;
        } */
        if (age_y !== 0 || age_y > 0) {
            if (age_y === 1) {
                return age_y + ' ' + 'year'
            } else {
                return age_y + ' ' + 'years'
            }
        } else if (age_m !== 0 || age_m > 0) {
            if (age_m === 1) {
                return age_m + ' ' + 'month'
            } else {
                return age_m + ' ' + 'months'
            }
        } else {
            if (age_d === 1) {
                return age_d + ' ' + 'day'
            } else {
                return age_d + ' ' + 'days'
            }
        }
    },


    unitConversion: (cases) => {
        if (isNaN(cases)) return cases;
        if (cases < 999) {
            return cases;
        }
        if (cases < 1000000) {
            return Math.round(cases / 1000) + "K";
        }
        if (cases < 10000000) {
            return (cases / 1000000).toFixed(2) + "M";
        }
        if (cases < 1000000000) {
            return Math.round((cases / 1000000)) + "M";
        }
        if (cases < 1000000000000) {
            return Math.round((cases / 1000000000)) + "B";
        }
        return "1T+";
    }
}
