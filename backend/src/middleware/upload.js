import multer from 'multer';
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
    destination(req,file,cb){

        let folder = 'uploads/temp';

        if(file.mimetype.startsWith('image/')){
            folder = 'uploads/images'
        }

        if(file.mimetype.startsWith('video/')){
            folder = 'uploads/videos'
        }

        ensureDir(folder);

        cb(null,folder)
        
    }

    ,
    filename(req,file,cb){
         const extension = path.extname(file.originalname);
         const fileName = `${uuid()}${extension}`;

         cb(null,fileName);
    }
})

const fileFilter = (req,file,cb)=>{

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "image/avif",
        "video/webm",
        "video/mp4",
        "video/mpeg",
    ]

    if(!allowedTypes.includes(file.mimetype)){
        return cb(new Error('Invalid file type'),false);
    }

    cb(null,true);
}

const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: '20*1024*1024',
        files:5 //maximum 5 files 
    }
})

export default upload;