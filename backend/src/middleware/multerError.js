import multer from "multer";

const handleMulterError  = (res,err)=>{
    if(err instanceof multer.MulterError){
        switch(err.code){
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({message:'File size too large'})

            case "LIMIT_FILE_COUNT":
                return res.status(400).json({message:'Maximum 5 files are allowed'});

            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({message:'Unexpected file'});

            default:
                return res.status(400).json({message:err.message})
        }
    }

    return res.status(500).json({message:err.message || 'File upload failed'})
};

export default handleMulterError;
