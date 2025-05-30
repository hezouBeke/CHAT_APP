import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        minlength: 6 
        // 'required' est retiré car les utilisateurs Google n'ont pas de mot de passe
    },
    profilePic: { 
        type: String, 
        default: "" 
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true // Permet d'avoir plusieurs utilisateurs sans googleId
    },
    authMethod: { 
        type: String, 
        enum: ['local', 'google'], // Soit 'local' (email/mdp), soit 'google'
        default: 'local' 
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;