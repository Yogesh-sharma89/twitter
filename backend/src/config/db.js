import mongoose from 'mongoose';

const ConnectToDb = async ()=>{
    try{
       await mongoose.connect(process.env.DB_URL);
       console.log('Database is connect successfully ✅')
    }catch(err){

        console.log('Error in database connection : '+err);
        process.exit(1);
    }
}

export default ConnectToDb;