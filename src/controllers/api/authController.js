const Transformer = require('object-transformer')
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const Func = require('../../services/checkFun')
const moment = require('moment')
const {
    userRegisterValidation,
    userLoginValidation,
} = require('../../services/UserValidation')
const {
    forgotPasswordValidation,
    changePasswordValidation
} = require('../../services/AdminValidation')
const {
    editProfileValidation,
    kycValidation,
    checkMobileVerification
} = require('../../services/UserValidation')
const {Login} = require('../../transformers/api/UserTransformer')
const {User, userSocial, userKYC} = require('../../models')
const {issueUser} = require('../../services/jwtTokenForUser')
const {Op} = require('sequelize')
const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')
const Mailer = require('../../services/Mailer')
const bcrypt = require('bcryptjs');
const _ = require('lodash')

module.exports = {

    /**
     * @description "This function is for User-Registration."
     * @param req
     * @param res
     */
    userRegistration: async (req, res) => {
        const requestParams = req.fields
        let image = false
        userRegisterValidation(requestParams, res, async (validate) => {
            if (validate) {
                let checkMobileExist
                let checkEmailExist
                const time = moment().unix()
                if (req.files.profile_image && req.files.profile_image.size > 0) {
                    image = true
                    await Helper.imageValidation(req, res, req.files.profile_image)
                    await Helper.imageSizeValidation(req, res, req.files.profile_image.size)
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        Constants.BAD_REQUEST
                    )
                }
                const imageName = image ? `${time}${path.extname(req.files.profile_image.name)}` : ''
                checkMobileExist = User.findOne({
                    where: {
                        mobile: requestParams.mobile,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                })
                checkEmailExist = User.findOne({
                    where: {
                        email: requestParams.email,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                })
                if (requestParams.provider_data) {
                    for(const property in requestParams.provider_data) {
                        await checkSocialID(requestParams.provider_data[property],res)
                    }
                }
                await checkEmailExist.then(async (emailData) => {
                    if (emailData) {
                        const checkUser = await socialAccountCheckByUser(emailData.id, res)
                        if (!checkUser) {
                            Response.socialError(res, res.locals.__('AccountAlreadyExist'), Constants.ACCOUNT_TYPE.LOCAL)
                        }
                    } else {
                        await checkMobileExist.then(async (mobData) => {
                            if (mobData) {
                                return Response.successResponseWithoutData(
                                    res,
                                    res.__('mobileExists'),
                                    Constants.FAIL
                                )
                            } else {
                                const otp = await Helper.makeRandomDigit(4)
                                const pass = await bcrypt.hash(requestParams.password, 10)
                                const minutesLater = new Date()
                                const otpTokenExpire = minutesLater.setMinutes(minutesLater.getMinutes() + 20)
                                const UserObj = {
                                    first_name: requestParams.first_name,
                                    last_name: requestParams.last_name,
                                    email: requestParams.email,
                                    password: pass,
                                    address: requestParams.address,
                                    mobile: requestParams.mobile,
                                    otp,
                                    otp_expiry: otpTokenExpire,
                                    qr_code: `${time}.png`,
                                    profile_image : imageName
                                }
                                if (!requestParams.provider_data) {
                                    const locals = {
                                        username: requestParams.first_name,
                                        appName: Helper.AppName,
                                        email: requestParams.email,
                                        otp: otp,
                                        lab_admin_url: process.env.ADMIN_APP_URL.trim()
                                    }
                                    try {
                                        // const mail = await Mailer.sendMail(requestParams.email, 'New Password', Helper.newPasswordTemplate, locals)
                                        // if (!mail) {
                                        //     return Response.errorResponseData(res, res.locals.__('globalError'), Constants.INTERNAL_SERVER)
                                        // }
                                        console.log('mail-sent')
                                    } catch (e) {
                                        console.log(e)
                                        return Response.errorResponseData(
                                            res,
                                            e.message,
                                            Constants.INTERNAL_SERVER
                                        )
                                    }
                                }
                                await User.create(UserObj)
                                    .then(async (result) => {
                                        if (result) {
                                            if (image) {
                                                await Helper.uploadImage(req.files.profile_image, Constants.USER_PROFILE_IMAGE, imageName)
                                            }
                                            const qrLocation = path.join(__dirname, '../../../public/uploads') + '/' + Constants.USER_QR_CODE + '/'
                                            if (!fs.existsSync(qrLocation)) {
                                                fs.mkdirSync(qrLocation, {recursive: true}, (err) => {
                                                })
                                            }
                                            const UserObjInQrCode = {
                                                user_id: result.id
                                            }
                                            QRCode.toFile(`${qrLocation}${time}.png`, JSON.stringify(UserObjInQrCode), {
                                                color: {
                                                    light: '#ffff' // Transparent background
                                                }
                                            }, function (err) {
                                                if (err) throw err
                                            })
                                            if (requestParams.provider_data) {
                                                const userSocialAuthMeta = await getSocialAuthType(requestParams, result)
                                                await userSocial.create(userSocialAuthMeta)
                                            }
                                            return Response.successResponseWithoutData(
                                                res,
                                                res.__('userRegistrationSuccessful'),
                                                Constants.SUCCESS
                                            )
                                        }
                                    }).catch((e) => {
                                        return Response.errorResponseData(
                                            res,
                                            res.__('internalError'),
                                            Constants.INTERNAL_SERVER
                                        )
                                    })
                            }
                        })
                    }
                })
            }
        })
    },


    /**
     * @description "This function is for User-Login."
     * @param req
     * @param res
     */
    login: async (req, res) => {
        const reqParam = req.body
        userLoginValidation(reqParam, res, async (validate) => {
            if (validate) {
                const isLocal = isLocalAuth(reqParam)
                let user = {}
                if (isLocal) {
                    if (reqParam.email) {
                        user = await getUserByEmail(reqParam.email)
                    }
                } else {
                    user = await getUserBySocial(reqParam.social_id)
                    if (!user) {
                        user = await getUserByEmail(reqParam.email)
                        if (user) {
                            Response.socialError(res, res.locals.__('AccountAlreadyExist'), Constants.ACCOUNT_TYPE.LOCAL)
                        }
                    }
                }
                if (user && isLocal) {
                    const userSocialCheck = await userSocial.findOne({where: {user_id: user.id}})
                    if (userSocialCheck) {
                        if (userSocialCheck.name === 'GOOGLE') {
                            Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithGoogle'), Constants.ACCOUNT_TYPE.GOOGLE)
                        } else if (userSocialCheck.name === 'FACEBOOK') {
                            Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithFacebook'), Constants.ACCOUNT_TYPE.FACEBOOK)
                        }
                    }
                }
                if (_.isNull(user) && isLocal) {
                    Response.successResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
                        Constants.FAIL
                    )
                } else if (_.isNull(user) && !isLocal) {
                    Response.successResponseWithoutData(
                        res,
                        res.locals.__('socialAccNotFoundSignupToContinue'),
                        Constants.FAIL
                    )
                }
                if (user.status === Constants.ACTIVE) {
                    let checkPass = true
                    if(isLocal){
                    checkPass = await bcrypt.compare(reqParam.password, user.password)
                    }
                    if(checkPass){
                        const userExpTime =
                            Math.floor(Date.now() / 1000) +
                            60 * 60 * 24 * process.env.USER_TOKEN_EXP
                        const payload = {
                            id: user.id,
                            exp: userExpTime
                        }
                        user.created_at = Helper.dateTimeTimestamp(user.createdAt)
                        user.updated_at = Helper.dateTimeTimestamp(user.updatedAt)
                        user.qr_code = Helper.mediaUrl(Constants.USER_QR_CODE, user.qr_code)
                        user.profile_image = Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, user.profile_image)
                        const token = issueUser(payload)
                        const meta = {token}
                        return Response.successResponseData(
                            res,
                            new Transformer.Single(user, Login).parse(),
                            Constants.SUCCESS,
                            res.locals.__('loginSuccess'),
                            meta
                        )
                    }else {
                        Response.successResponseWithoutData(
                            res,
                            res.locals.__('usernamePassNotMatch'),
                            Constants.FAIL
                        )
                    }
                } else {
                    Response.successResponseWithoutData(
                        res,
                        res.locals.__('accountIsInactive'),
                        Constants.FAIL
                    )
                }
            }
        })
    },



    /**
     * @description "This function is to Verify User-Email."
     * @param req
     * @param res
     */
    verifyEmail: async (req, res) => {
        const requestParams = req.fields
        await User.findOne({
            where: {
                email: requestParams.email,
            }
        }).then(async (userData) => {
            if (userData) {
                if (userData.otp === requestParams.otp) {
                    userData.verification_status = Constants.VERIFIED
                    await userData.save().then(() => {
                        return Response.successResponseWithoutData(
                            res,
                            res.__('emailVerifiedSuccessfully'),
                            Constants.SUCCESS
                        )
                    }).catch(() => {
                        return Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    })
                } else {
                    return Response.successResponseWithoutData(
                        res,
                        res.__('invalidOTPorEmail'),
                        Constants.FAIL
                    )
                }
            }
        }).catch(() => {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                Constants.INTERNAL_SERVER
            )
        })
    },


    /**
     * @description This function is for User Forgot Password.
     * @param req
     * @param res
     */
    forgotPassword: async (req, res) => {
        const reqParam = req.fields
        forgotPasswordValidation(reqParam, res, (validate) => {
            if (validate) {
                User.findOne({
                    where: {
                        email: reqParam.email.toLowerCase(),
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                }).then(
                    async (user) => {
                        if (user) {
                            if (user.status === Constants.ACTIVE) {
                                const minutesLater = new Date()
                                const restTokenExpire = minutesLater.setMinutes(
                                    minutesLater.getMinutes() + 60
                                )
                                const otp = await Helper.makeRandomNumber(10)
                                const hash = bcrypt.hashSync(otp, 10)
                                user.password = hash
                                user.code_expiry = restTokenExpire
                                await user.save().then(
                                    async (updatedUser) => {
                                        if (!updatedUser) {
                                            Response.errorResponseData(
                                                res,
                                                res.locals.__('accountIsInactive'),
                                                Constants.BAD_REQUEST
                                            )
                                        } else {
                                            const locals = {
                                                username: user.first_name,
                                                appName: Helper.AppName,
                                                otp
                                            }
                                            try {
                                                const mail = await Mailer.sendMail(reqParam.email, 'Forgot Password', Helper.forgotTemplate, locals)
                                                if (mail) {
                                                    return Response.successResponseData(res, null, Constants.SUCCESS, res.locals.__('forgotPasswordEmailSendSuccess'))
                                                } else {
                                                    return Response.errorResponseData(res, res.locals.__('globalError'), Constants.INTERNAL_SERVER)
                                                }
                                            } catch (e) {
                                                return Response.errorResponseData(
                                                    res,
                                                    e.message,
                                                    Constants.INTERNAL_SERVER
                                                )
                                            }
                                        }
                                        return null
                                    },
                                    () => {
                                        Response.errorResponseData(
                                            res,
                                            res.__('internalError'),
                                            Constants.INTERNAL_SERVER
                                        )
                                    }
                                )
                            } else {
                                Response.errorResponseData(
                                    res,
                                    res.locals.__('accountIsInactive'),
                                    Constants.BAD_REQUEST
                                )
                            }
                        } else {
                            Response.successResponseWithoutData(
                                res,
                                res.locals.__('emailNotExists'),
                                Constants.FAIL
                            )
                        }
                    },
                    () => {
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    }
                )
            }
        })
    },


    /**
     * @description This function is for User Change Password.
     * @param req
     * @param res
     */
    changePassword: async (req, res) => {
        const {authUserId} = req
        const requestParams = req.fields
        changePasswordValidation(requestParams, res, async (validate) => {
            if (validate) {
                await User.findOne({
                    where: {
                        id: authUserId,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                })
                    .then(async (userData) => {
                        if (userData) {
                            bcrypt.compare(
                                requestParams.old_password,
                                userData.password,
                                async (err, oldPasswordRes) => {
                                    if (err) {
                                        Response.errorResponseData(
                                            res,
                                            res.__('somethingWentWrong'),
                                            Constants.INTERNAL_SERVER
                                        )
                                    }
                                    if (oldPasswordRes) {
                                        bcrypt.compare(
                                            requestParams.password,
                                            userData.password,
                                            async (innerErr, newPasswordRes) => {
                                                if (innerErr) {
                                                    Response.errorResponseData(
                                                        res,
                                                        res.__('somethingWentWrong'),
                                                        Constants.INTERNAL_SERVER
                                                    )
                                                }
                                                if (newPasswordRes) {
                                                    Response.successResponseWithoutData(
                                                        res,
                                                        res.__('oldNewPasswordSame'),
                                                        Constants.FAIL
                                                    )
                                                } else {
                                                    bcrypt.hash(
                                                        requestParams.password,
                                                        10,
                                                        (bcryptErr, userPass) => {
                                                            if (bcryptErr) {
                                                                Response.errorResponseData(
                                                                    res,
                                                                    res.__('somethingWentWrong'),
                                                                    Constants.INTERNAL_SERVER
                                                                )
                                                            }
                                                            User.update(
                                                                {
                                                                    password: userPass
                                                                },
                                                                {
                                                                    where: {
                                                                        id: userData.id
                                                                    }
                                                                }
                                                            ).then((update) => {
                                                                if (update) {
                                                                    Response.successResponseWithoutData(
                                                                        res,
                                                                        res.__('changePasswordSuccess')
                                                                    )
                                                                } else {
                                                                    Response.errorResponseData(
                                                                        res,
                                                                        res.__('somethingWentWrong'),
                                                                        Constants.INTERNAL_SERVER
                                                                    )
                                                                }
                                                            })
                                                        }
                                                    )
                                                }
                                            })
                                    } else {
                                        Response.successResponseWithoutData(
                                            res,
                                            res.__('oldPasswordNotMatch'),
                                            Constants.FAIL
                                        )
                                    }
                                }
                            )
                        } else {
                            return Response.successResponseData(
                                res,
                                null,
                                Constants.SUCCESS,
                                res.locals.__('noUserFound')
                            )
                        }
                        return null
                    })
                    .catch(() => {
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    })
            } else {
                Response.errorResponseData(
                    res,
                    res.__('error'),
                    Constants.INTERNAL_SERVER
                )
            }
        })
    },

    /**
     * @description Edit Profile
     * @param req
     * @param res
     */
    editProfile: async (req, res) => {
        const requestParams = req.fields
        editProfileValidation(requestParams, res, async (validate) => {
            if (validate) {
                const userId = req.authUserId
                if (userId === null) {
                    return Response.errorResponseData(
                        res,
                        res.__('invalidId'),
                        Constants.BAD_REQUEST
                    )
                } else {
                    let image = false
                    if (req.files.profile_image && req.files.profile_image.size > 0) {
                        image = true
                        await Helper.imageValidation(req, res, req.files.profile_image)
                        await Helper.imageSizeValidation(req, res, req.files.profile_image.size)
                    }
                    await User
                        .findOne({
                            where: {
                                id: req.authUserId,
                                status: {
                                    [Op.ne]: Constants.DELETE
                                }
                            }
                        })
                        .then(async (profileData) => {
                            if (profileData) {
                                const oldImageName = profileData.profile_image
                                console.log("hello",profileData.mobile !== requestParams.mobile)
                                if (profileData.mobile !== requestParams.mobile || profileData.email !== requestParams.email) {
                                    await User.findOne({
                                        where: {
                                            mobile: requestParams.mobile,
                                            id: {
                                                [Op.ne]: req.authUserId
                                            },
                                            status: {
                                                [Op.ne]: Constants.DELETE
                                            }
                                        }
                                    }).then(async (profileDetail) => {
                                        if (profileDetail) {
                                            return Response.successResponseWithoutData(
                                                res,
                                                res.__('NumberAlreadyExist'),
                                                Constants.FAIL
                                            )
                                        } else {
                                            profileData.new_mobile = requestParams.mobile
                                            profileData.new_verification_status = Constants.NOT_VERIFIED
                                            const minutesLater = new Date();
                                            const expiry = minutesLater.setMinutes(minutesLater.getMinutes() + 20);
                                            profileData.new_email = requestParams.email
                                            profileData.email_expiry = expiry
                                            const otp = await Helper.makeRandomDigit(4)
                                            const otpSent = 200//await Helper.sendOTP(requestParams.country_code, requestParams.mobile, otp)
                                            if (otpSent === 200) {
                                                profileData.otp = otp
                                                profileData.otp_expiry = expiry
                                            } else {
                                                return Response.errorResponseData(
                                                    res,
                                                    res.__('internalError'),
                                                    Constants.INTERNAL_SERVER
                                                )
                                            }
                                        }
                                        return null
                                    })
                                }
                                profileData.first_name = requestParams.first_name
                                profileData.last_name = requestParams.last_name
                                profileData.address = requestParams.address
                                profileData.profile_image = image ? `${moment().unix()}${path.extname(req.files.profile_image.name)}` : profileData.profile_image
                                await profileData
                                    .save()
                                    .then(async (result) => {
                                        if (result) {
                                            if (image) {
                                                result.profile_image = Helper.mediaUrl(
                                                    Constants.USER_PROFILE_IMAGE,
                                                    result.profile_image
                                                )
                                                const imageName = image ? `${moment().unix()}${path.extname(req.files.profile_image.name)}` : ''
                                                await Helper.uploadImage(req.files.profile_image, Constants.USER_PROFILE_IMAGE, imageName)
                                                await Helper.removeOldImage(oldImageName, Constants.USER_PROFILE_IMAGE, res)
                                            } else {
                                                result.profile_image = Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, profileData.profile_image)
                                            }
                                            result.qr_code = Helper.mediaUrl(Constants.USER_QR_CODE, profileData.qr_code)
                                            return Response.successResponseData(
                                                res,
                                                new Transformer.Single(result, Login).parse(),
                                                Constants.SUCCESS,
                                                res.__('UserDataUpdatedSuccessfully')
                                            )
                                        }
                                        return null
                                    })
                                    .catch((f) => {
                                        console.log(f)
                                        return Response.errorResponseData(
                                            res,
                                            res.__('internalError'),
                                            Constants.INTERNAL_SERVER
                                        )
                                    })
                            } else {
                                return Response.successResponseWithoutData(
                                    res,
                                    res.__('UserDoesNotExits'),
                                    Constants.FAIL
                                )
                            }
                            return null
                        })
                        .catch((e) => {
                            console.log(e)
                            return Response.errorResponseData(
                                res,
                                res.__('internalError'),
                                Constants.INTERNAL_SERVER
                            )
                        })
                }
            }
        })
    },

    /**
     * @description 'This function is use to verify otp.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    verifyMobile: async (req, res) => {
        const requestParams = req.fields
        console.log("hello")
        checkMobileVerification(requestParams, res, async (validate) => {
            if (validate) {
                await User.findOne({
                    where: {
                        otp: requestParams.otp,
                        new_mobile: requestParams.mobile_number
                    }
                }).then(async (userData) => {
                    if (userData) {
                        console.log("hi")
                        if (userData.status === Constants.ACTIVE) {
                            if (userData.otp_expiry.getTime() > Date.now()) {
                                userData.otp_expiry = ''
                                userData.otp = ''
                                userData.mobile_number = requestParams.mobile_number
                                await userData.save().then(() => {
                                    return Response.successResponseWithoutData(
                                        res,
                                        res.__('emailVerifiedSuccessfully'),
                                        Constants.SUCCESS
                                    )
                                }).catch(() => {
                                    return Response.errorResponseData(
                                        res,
                                        res.__('internalError'),
                                        Constants.INTERNAL_SERVER
                                    )
                                })
                            } else {
                                Response.successResponseWithoutData(res, res.__('otpExpired'), Constants.FAIL);
                            }
                        } else {
                            Response.successResponseWithoutData(res, res.__('accountInactive'), Constants.FAIL);
                        }
                    }
                }).catch(() => {
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                })
            } else {
                Response.errorResponseData(res, res.__('error'), Constants.INTERNAL_SERVER);
            }
        });
    },

    /**
     * @description 'This function is use to add leave.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    kycAdd: async (req, res) => {
        const requestParams = req.fields
        let image = false
        kycValidation(requestParams, res, async (validate) => {
            if (validate) {
                const time = moment().unix()
                if (req.files.photo_id_image && req.files.address_image) {
                    image = true
                    await Helper.imageValidation(req, res, req.files.photo_id_image)
                    await Helper.imageSizeValidation(req, res, req.files.photo_id_image.size)
                    await Helper.imageValidation(req, res, req.files.address_image)
                    await Helper.imageSizeValidation(req, res, req.files.address_image.size)
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        Constants.BAD_REQUEST
                    )
                }
                const photoIDImage = image ? `${time}${path.extname(req.files.photo_id_image.name)}` : ''
                const addressImage = image ? `${time}${path.extname(req.files.address_image.name)}` : ''
                const userKycObj = {
                    firstName: requestParams.firstName,
                    lastName: requestParams.lastName,
                    dob: requestParams.dob,
                    address: requestParams.address,
                    city: requestParams.city,
                    state: requestParams.state,
                    zipcode: requestParams.zipcode,
                }
                if(image){
                    userKycObj.photo_id_proof = requestParams.photo_id_proof
                    userKycObj.photo_id_image = photoIDImage
                    userKycObj.address_proof = requestParams.address_proof
                    userKycObj.address_image = addressImage
                }
                await userKYC.create(userKycObj)
                    .then(async (result) => {
                        if (result) {
                            if(image){
                                await Helper.uploadImage(req.files.photo_id_image, Constants.PHOTO_IMAGE, photoIDImage)
                                await Helper.uploadImage(req.files.address_image, Constants.ADDRESS_IMAGE, addressImage)
                            }
                            Response.successResponseWithoutData(
                                res,
                                res.__('KYCAddedSuccessfully.'),
                                Constants.SUCCESS,
                            )
                        }
                    })
                    .catch(async (e) => {
                        Response.errorResponseData(
                            res,
                            res.__('internalError'),
                            Constants.INTERNAL_SERVER
                        )
                    })
            }
        })
    },
}
/*-----------------------------------User Functions-------------------------------------------*/

const socialAccountCheckByID = async (socialId, res) => {
    const socialUser = await userSocial.findOne({where: {social_id: socialId}})
    if (socialUser) {
        if (socialUser.name === 'GOOGLE') {
            return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithGoogle'), Constants.ACCOUNT_TYPE.GOOGLE)
        } else if (socialUser.name === 'FACEBOOK') {
            return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithFacebook'), Constants.ACCOUNT_TYPE.FACEBOOK)
        }
    } else return false
}

const socialAccountCheckByUser = async (userId, res) => {
    const socialUser = await userSocial.findOne({where: {user_id: userId}})
    if (socialUser) {
        if (socialUser.name === 'GOOGLE') {
            return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithGoogle'), Constants.ACCOUNT_TYPE.GOOGLE)
        } else if (socialUser.name === 'FACEBOOK') {
            return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithFacebook'), Constants.ACCOUNT_TYPE.FACEBOOK)
        }
    } else return false
}

const getSocialAuthType = async (body, user) => {
    let userSocialAuthMeta = {}

    // Google
    if (!_.isUndefined(body.provider_data.google_id)) {
        userSocialAuthMeta = {
            social_id: body.provider_data.google_id,
            name: 'GOOGLE',
            user_id: user.id,
            provider_data: body.provider_data
        }
        return userSocialAuthMeta
    }

    // Facebook
    if (!_.isUndefined(body.provider_data.facebook_id)) {
        userSocialAuthMeta = {
            social_id: body.provider_data.facebook_id,
            name: 'FACEBOOK',
            user_id: user.id,
            provider_data: body.provider_data
        }
        return userSocialAuthMeta
    }
}

const isLocalAuth = body =>
    _.isUndefined(body.social_id) ||
    _.isNull(body.social_id) ||
    body.social_id === ''


const getUserByEmail = email =>
    User.findOne({
        where: {email: email}
    })

const getUserBySocial = id =>
    User.findOne({
        include: [
            {
                model: userSocial,
                where: {social_id: id}
            }
        ]
    })

const checkSocialID = (socialId,res) =>
    userSocial.findOne({
        where : {
            social_id : socialId
        }
    }).then((data)=>{
        if (data){
            if (data.name === 'GOOGLE') {
                return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithGoogle'), Constants.ACCOUNT_TYPE.GOOGLE)
            } else if (data.name === 'FACEBOOK') {
                return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithFacebook'), Constants.ACCOUNT_TYPE.FACEBOOK)
            }
        }
        return null
    })


