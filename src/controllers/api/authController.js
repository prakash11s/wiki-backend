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
    verifyNewMobileValidation,
    verifyNewEmailValidation,
    emailVerificationValidation,
    mobileVerificationValidation
} = require('../../services/UserValidation')
const {Login, userDetails} = require('../../transformers/api/UserTransformer')
const {User, userSocial, userAccount} = require('../../models')
const {issueUser} = require('../../services/jwtTokenForUser')
const {Op} = require('sequelize')
const path = require('path')
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
        const requestParams = req.body
        let image = false
        userRegisterValidation(requestParams, res, async (validate) => {
            if (validate) {
                let checkMobileExist
                let checkEmailExist
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
                if (requestParams.social_data) {
                    let social_id
                    for (const property in requestParams.social_data.auth_id) {
                        social_id = requestParams.social_data.auth_id[property]
                    }
                    await checkSocialID(social_id, res)
                }
                await checkEmailExist.then(async (emailData) => {
                    if (emailData) {
                        const checkUser = await socialAccountCheckByUser(emailData.id, res)
                        if (!checkUser) {
                            return Response.socialError(res, res.locals.__('AccountAlreadyExist'), Constants.ACCOUNT_TYPE.LOCAL)
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
                                const mobile_otp = '1234'//await Helper.makeRandomDigit(4)
                                const email_otp = '123456'//await Helper.makeRandomDigit(6)
                                const pass = requestParams.password ? await bcrypt.hash(requestParams.password, 10) : ''
                                const minutesLater = new Date()
                                const emailExpiry = minutesLater.setMinutes(minutesLater.getMinutes() + 30)
                                const mobileExpiry = minutesLater.setMinutes(minutesLater.getMinutes() + 15)
                                const UserObj = {
                                    first_name: requestParams.first_name,
                                    last_name: requestParams.last_name,
                                    email: requestParams.email,
                                    password: pass,
                                    mobile: requestParams.mobile,
                                    mobile_otp,
                                    email_otp,
                                    mobile_otp_expiry: mobileExpiry,
                                    email_otp_expiry: emailExpiry,
                                }
                                if (requestParams.social_data) {
                                    UserObj.is_mobile_verified = true
                                    UserObj.is_email_verified = true
                                }
                                //TODO: SEND_OTP
                                if (!requestParams.social_data) {
                                    const locals = {
                                        username: requestParams.first_name,
                                        appName: Helper.AppName,
                                        email: requestParams.email,
                                        otp: email_otp,
                                    }
                                    try {
                                        const mail = await Mailer.sendMail(requestParams.email, 'Email Verification', Helper.emailVerificationMail, locals)
                                        if (!mail) {
                                            return Response.errorResponseData(res, res.locals.__('globalError'), Constants.INTERNAL_SERVER)
                                        }
                                    } catch (e) {
                                        console.log(e)
                                        return Response.errorResponseData(
                                            res,
                                            e.message,
                                            Constants.INTERNAL_SERVER
                                        )
                                    }
                                }
                                await User.create(UserObj).then(async (result) => {
                                    if (result) {
                                        const socialObj = {
                                            user_id: result.id
                                        }
                                        await userAccount.create(socialObj).then(async (accountData) => {
                                            if (requestParams.social_data) {
                                                const userSocialAuthMeta = await getSocialAuthType(requestParams, result)
                                                await userSocial.create(userSocialAuthMeta)
                                            }
                                            return Response.successResponseWithoutData(
                                                res,
                                                res.__('userRegistrationSuccessful'),
                                                Constants.SUCCESS
                                            )
                                        }).catch((e) => {
                                            console.log(e)
                                            return Response.errorResponseData(
                                                res,
                                                res.__('internalError'),
                                                Constants.INTERNAL_SERVER
                                            )
                                        })
                                    }
                                }).catch((e) => {
                                    console.log(e)
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
     * @description "This function is for Email-Verification."
     * @param req
     * @param res
     */
    userEmailVerification: async (req, res) => {
        const requestParams = req.body;
        emailVerificationValidation(requestParams, res, async (validate) => {
            if (validate) {
                User.findOne({
                    where: {
                        email: requestParams.email,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                }).then((tokenExists) => {
                    if (tokenExists) {
                        if (parseInt(requestParams.otp) === parseInt(tokenExists.email_otp)) {
                            if (tokenExists.email_otp_expiry >= Date.now()) {
                                if (tokenExists.is_email_verified === Constants.NOT_VERIFIED) {
                                    const Verification = {
                                        is_email_verified: Constants.VERIFIED,
                                    };
                                    User.update(Verification,
                                        {
                                            where: {
                                                id: tokenExists.id
                                            }
                                        }).then(async (update) => {
                                        if (update) {
                                            return Response.successResponseData(res, null, Constants.SUCCESS, res.locals.__('verificationSuccess'));
                                        } else {
                                            Response.errorResponseData(res, res.locals.__('somethingWentWrong'), FAIL);
                                        }
                                    });
                                } else {
                                    Response.successResponseWithoutData(res, res.locals.__('emailAlreadyVerified'), Constants.FAIL);
                                }
                            } else {
                                Response.successResponseWithoutData(res, res.locals.__('otpExpired'), Constants.FAIL);
                            }
                        } else {
                            Response.successResponseWithoutData(res, res.locals.__('wrongOTPEntered'), Constants.FAIL);
                        }
                    } else {
                        Response.successResponseWithoutData(res, res.locals.__('emailNotValid'), Constants.FAIL);
                    }
                }, (err) => {
                    Response.errorResponseData(res, res.__('internalError'), Constants.INTERNAL_SERVER);
                });
            }
        });
    },


    /**
     * @description "This function is for Mobile-Verification."
     * @param req
     * @param res
     */
    userMobileVerification: async (req, res) => {
        const requestParams = req.body;
        mobileVerificationValidation(requestParams, res, async (validate) => {
            if (validate) {
                User.findOne({
                    where: {
                        mobile: requestParams.mobile,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                }).then((tokenExists) => {
                    console.log(tokenExists);
                    if (tokenExists) {
                        if (parseInt(requestParams.otp) === parseInt(tokenExists.mobile_otp)) {
                            if (tokenExists.mobile_otp_expiry >= Date.now()) {
                                if (tokenExists.is_mobile_verified === Constants.NOT_VERIFIED) {
                                    const Verification = {
                                        is_mobile_verified: Constants.VERIFIED,
                                    };
                                    User.update(Verification,
                                        {
                                            where: {
                                                id: tokenExists.id
                                            }
                                        }).then(async (update) => {
                                        if (update) {
                                            return Response.successResponseData(res, null, Constants.SUCCESS, res.locals.__('mobileVerificationSuccess'));
                                        } else {
                                            Response.errorResponseData(res, res.locals.__('somethingWentWrong'), Constants.FAIL);
                                        }
                                    });
                                } else {
                                    Response.successResponseWithoutData(res, res.locals.__('mobileAlreadyVerfied'), Constants.FAIL);
                                }
                            } else {
                                Response.successResponseWithoutData(res, res.locals.__('otpExpired'), Constants.FAIL);
                            }
                        } else {
                            Response.successResponseWithoutData(res, res.locals.__('wrongOTPEntered'), Constants.FAIL);
                        }
                    } else {
                        Response.successResponseWithoutData(res, res.locals.__('mobileNumberNotValid'), Constants.FAIL);
                    }
                }, (err) => {
                    console.log(err)
                    Response.errorResponseData(res, res.__('internalError'), Constants.INTERNAL_SERVER);
                });
            }
        });
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
                        if (reqParam.email) {
                            user = await getUserByEmail(reqParam.email)
                        }
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
                    if (isLocal) {
                        checkPass = await bcrypt.compare(reqParam.password, user.password)
                    }
                    if (checkPass) {
                        if (user.is_mobile_verified && user.is_email_verified) {
                            const userExpTime =
                                Math.floor(Date.now() / 1000) +
                                60 * 60 * 24 * process.env.USER_TOKEN_EXP
                            const payload = {
                                id: user.id,
                                exp: userExpTime
                            }
                            user.created_at = Helper.dateTimeTimestamp(user.createdAt)
                            user.updated_at = Helper.dateTimeTimestamp(user.updatedAt)
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
                        } else {
                            user.created_at = Helper.dateTimeTimestamp(user.createdAt)
                            user.updated_at = Helper.dateTimeTimestamp(user.updatedAt)
                            user.profile_image = user.profile_image ? Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, user.profile_image) : ''
                            return Response.successResponseData(
                                res,
                                new Transformer.Single(user, Login).parse(),
                                Constants.FAIL,
                                res.locals.__('pleaseVerifyYourEmailAndMobile'),
                            )
                        }
                    } else {
                        return Response.successResponseWithoutData(
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
                        mobile: reqParam.mobile,
                        status: {
                            [Op.ne]: Constants.DELETE
                        }
                    }
                }).then(async (user) => {
                        if (user) {
                            if (user.status === Constants.ACTIVE) {
                                const minutesLater = new Date()
                                const restTokenExpire = minutesLater.setMinutes(
                                    minutesLater.getMinutes() + 60
                                )
                                const otp = await Helper.makeRandomNumber(10)
                                //const hash = bcrypt.hashSync(otp, 10)
                                user.otp = otp
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
                                            //TODO:SEND OTP HERE
                                            const locals = {
                                                username: user.first_name,
                                                appName: Helper.AppName,
                                                otp
                                            }
                                            try {
                                                const mail = await Mailer.sendMail(reqParam.email, 'Forgot Password', Helper.forgotTemplate, locals)
                                                if (mail) {
                                                    return Response.successResponseData(res, null, Constants.SUCCESS, res.locals.__('otpSentToEmailAndMobile'))
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
                }).then(async (userData) => {
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
                    await User.findOne({
                        where: {
                            id: req.authUserId,
                            status: {
                                [Op.ne]: Constants.DELETE
                            }
                        }
                    })
                        .then(async (profileData) => {
                            if (profileData) {
                                const otp = '1234'//await Helper.makeRandomDigit(4)
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
                                            profileData.is_mobile_verified = Constants.NOT_VERIFIED
                                            const minutesLater = new Date();
                                            const expiry = minutesLater.setMinutes(minutesLater.getMinutes() + 20);
                                            profileData.new_email = requestParams.email
                                            profileData.email_expiry = expiry
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
                                                const locals = {
                                                    appName: Helper.AppName,
                                                    verification_code: otp,
                                                    link: `${process.env.API_URL}/reset-mobile-email?otp=${otp}`
                                                };
                                                const imageName = image ? `${moment().unix()}${path.extname(req.files.profile_image.name)}` : ''
                                                await Helper.uploadImage(req.files.profile_image, Constants.USER_PROFILE_IMAGE, imageName)
                                                await Mailer.sendMail(requestParams.email, 'Reset Your Odyssey mobile/email', Helper.welcomeTemplate, locals);
                                            } else {
                                                result.profile_image = Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, profileData.profile_image)
                                            }
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
     * @description "This function is to Verify User-Email."
     * @param req
     * @param res
     */
    verifyNewEmail: async (req, res) => {
        const requestParams = req.fields
        verifyNewEmailValidation(requestParams, res, async (validate) => {
            if (validate) {
                await User.findOne({
                    where: {
                        otp: requestParams.otp,
                        new_email: requestParams.email
                    }
                }).then(async (userData) => {
                    if (userData) {
                        if (userData.status === Constants.ACTIVE) {
                            if (userData.email_expiry.getTime() > Date.now()) {
                                userData.email_expiry = ''
                                userData.otp = ''
                                userData.email = requestParams.email
                                userData.email_verification_status = Constants.VERIFIED
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
                                Response.successResponseWithoutData(
                                    res, res.__('otpExpired'),
                                    Constants.FAIL
                                );
                            }
                        } else {
                            Response.successResponseWithoutData(
                                res, res.__('accountInactive'),
                                Constants.FAIL
                            );
                        }
                    } else {
                        return Response.successResponseWithoutData(
                            res,
                            res.__('invalidOTPorEmail'),
                            Constants.FAIL
                        )
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
     * @description 'This function is for User's Details.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    myDetails: async (req, res) => {
        const userId = req.authUserId
        if (userId === null) {
            return Response.errorResponseData(
                res,
                res.__('invalidId'),
                Constants.BAD_REQUEST
            )
        } else {
            await User.findOne({
                where: {
                    id: userId,
                    status: {
                        [Op.ne]: [Constants.DELETE]
                    }
                }
            }).then(async (result) => {
                if (result) {
                    result.profile_image = Helper.mediaUrl(Constants.USER_PROFILE_IMAGE, result.profile_image)
                    return Response.successResponseData(
                        res,
                        new Transformer.Single(result, userDetails).parse(),
                        Constants.SUCCESS,
                        res.__('success')
                    )
                } else {
                    return Response.successResponseData(
                        res,
                        {},
                        Constants.SUCCESS,
                        res.__('noDataFound')
                    )
                }
            })
                .catch(() => {
                    return Response.errorResponseData(
                        res,
                        res.__('internalError'),
                        Constants.INTERNAL_SERVER
                    )
                })
        }
    },


    /**
     * @description 'This function is use to verify otp.'
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    verifyNewMobile: async (req, res) => {
        const requestParams = req.fields
        verifyNewMobileValidation(requestParams, res, async (validate) => {
            if (validate) {
                await User.findOne({
                    where: {
                        otp: requestParams.otp,
                        new_mobile: requestParams.mobile_number
                    }
                }).then(async (userData) => {
                    if (userData) {
                        if (userData.status === Constants.ACTIVE) {
                            if (userData.otp_expiry.getTime() > Date.now()) {
                                userData.otp_expiry = ''
                                userData.otp = ''
                                userData.mobile_number = requestParams.mobile_number
                                userData.verification_status = Constants.VERIFIED
                                await userData.save().then(() => {
                                    return Response.successResponseWithoutData(
                                        res,
                                        res.__('mobileVerifiedSuccessfully'),
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
    if (!_.isUndefined(body.social_data.auth_id.google_id)) {
        userSocialAuthMeta = {
            social_id: body.social_data.auth_id.google_id,
            name: 'GOOGLE',
            user_id: user.id,
            social_data: body.social_data
        }
        return userSocialAuthMeta
    }

    // Facebook
    if (!_.isUndefined(body.social_data.auth_id.facebook_id)) {
        userSocialAuthMeta = {
            social_id: body.social_data.auth_id.facebook_id,
            name: 'FACEBOOK',
            user_id: user.id,
            social_data: body.social_data
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

const checkSocialID = async (socialId, res) => {
    await userSocial.findOne({
        where: {
            social_id: socialId
        }
    }).then((data) => {
        if (data) {
            if (data.name === 'GOOGLE') {
                return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithGoogle'), Constants.ACCOUNT_TYPE.GOOGLE)
            } else if (data.name === 'FACEBOOK') {
                return Response.socialError(res, res.locals.__('socialAccountAlreadyExistWithFacebook'), Constants.ACCOUNT_TYPE.FACEBOOK)
            }
        }
        return null
    })
}


