import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export default cloudinary;


export const uploadToCloudinary = async (filepath,mimeType)=>{
    
    const isVideo = mimeType.startsWith('video/');

    const result = await cloudinary.uploader.upload(filepath,{
        resource_type:isVideo ? 'video' : 'image',
        folder:'posts'
    })

    return {
        url:result.secure_url,
        type:isVideo? 'video' : 'image',
        publicId : result.public_id
    }
}
