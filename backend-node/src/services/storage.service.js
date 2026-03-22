const cloudinary = require("cloudinary").v2
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({ storage })

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "TraceIt" },
            (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
            }
        ).end(fileBuffer)
    })
}

module.exports = { upload, uploadToCloudinary }