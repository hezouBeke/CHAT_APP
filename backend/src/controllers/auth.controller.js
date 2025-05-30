import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        
       
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
   try {
    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({ message: "Invalid creantials" })
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if(!isPasswordCorrect){
        return res.status(400).json({ message: "Invalid creantials" })
    }
      
    generateToken(user._id,res)
    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
    })
    
   } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
   }
};
export const logout = (req, res) => {
     try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message : "Logged out successfully" })
     } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal server error" });    
     }
}

export const updateProfile = async (req, res) => {   
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            res.status(400).json({ message: "Profile pic is required" });   
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updateUser);

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal server error" });  
    }
}

export const checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const googleAuth = async (req, res) => {
    const { token } = req.body; // Token reçu du frontend

    try {
        // 1. Vérification du token Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Vérifie que le token est pour notre app
        });

        // 2. Extraction des données utilisateur
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // 3. Recherche de l'utilisateur dans la base de données
        let user = await User.findOne({ 
            $or: [
                { email }, // Cherche par email
                { googleId } // Ou par googleId
            ] 
        });

        // 4. Gestion des cas :
        // - Utilisateur existe déjà avec Google
        // - Utilisateur existe en local mais se connecte pour la 1ère fois avec Google
        // - Nouvel utilisateur
        if (!user) {
            // Cas 1 : Nouvel utilisateur
            user = new User({
                fullName: name,
                email,
                googleId,
                profilePic: picture,
                authMethod: 'google'
            });
        } else if (!user.googleId) {
            // Cas 2 : Utilisateur existant en local, ajoute Google
            user.googleId = googleId;
            user.authMethod = 'google';
            if (!user.profilePic) user.profilePic = picture;
        }

        // 5. Sauvegarde en base de données
        await user.save();

        // 6. Génération du token JWT (comme pour une connexion normale)
        generateToken(user._id, res);

        // 7. Réponse avec les données utilisateur
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.error("Erreur dans googleAuth:", error.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};