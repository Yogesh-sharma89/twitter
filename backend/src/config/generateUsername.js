import User from "../models/user.model.js";

function generateBaseUsername(fullname) {
  return fullname
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")        // space → _
    .replace(/[^a-z0-9_]/g, "")  // remove invalid chars
}

export async function GenerateUniqueUsername(firstname,lastname=''){

    const fullName = [firstname, lastname]
    .filter(Boolean)
    .join(" ");

    let baseUsername = generateBaseUsername(fullName);

    if(!baseUsername){
        baseUsername = `user_${Date.now()}`
    }

    let username = baseUsername;

    let counter = 1;

    //check uniqueness for user with same name 

    while(await User.exists({username})){
        username = `${username}_${counter}`
        counter+=1;
    }

    return username;
}