module.exports = {
    SUCCESS: 1,
    FAIL: 0,
    BAD_REQUEST: 400,
    PAGE_NOT_FOUND: 404,
    ACTIVE: 1,
    INACTIVE: 0,
    DELETE: 2,
    SUPER_ADMIN: 1,
    SUB_ADMIN: 2,
    INTERNAL_SERVER: 500,
    PER_PAGE: 10,
    DEFAULT_PAGE: 1,
    NOT_VERIFIED: 0,
    VERIFIED: 1,
    ANDROID: 1,
    IOS: 2,
    WEB: 3,
    TERMS_AND_CONDITIONS: 1,
    PRIVACY_POLICY: 2,
    CONTACT_US: 1,
    PROFILE_IMAGE_PATH_S3: 'user/profile-image',
    KYC_IMAGE_PATH_S3: 'user/kyc-image',
    ADVERT_IMAGE_PATH_S3: 'adverts',
    USER_PROFILE_IMAGE: 'user/image',
    PHOTO_IMAGE: 'user/kyc/photo-id',
    ADDRESS_IMAGE: 'user/kyc/address',
    ADD_TOKEN: 1,
    REMOVE_TOKEN: 2,
    GENDER_MALE: 1,
    GENDER_FEMALE: 2,
    GENDER_OTHER: 3,
    MAINTENANCE_MODE: {
        UP: 1,
        DOWN: 0
    },
    IMAGE_TYPE: {
        OG: 'og',
        NORMAL: 'normal'
    },
    ACCOUNT_TYPE: {
        LOCAL: 1,
        GOOGLE: 2,
        FACEBOOK: 3
    },
    POD_TYPE: {
        INDIVIDUAL: 'individual',
        GROUP: 'group'
    }
}
