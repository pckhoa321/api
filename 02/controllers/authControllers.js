const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JsonWebTokenError } = require("jsonwebtoken");
let refreshTokens = [];

const authController = {
    //register
    registerUser: async(req,res) => {
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //create new user
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            //save to DB
            const user = await newUser.save();
        
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
    },

    //generate access token
    generateAccessToken:(user)=>{
        return jwt.sign({
            id: user.id,
            admin:user.admin,
        },
        process.env.PRIVATE_KEY,
        {expiresIn:"60s"}
        );
    },

    //generate refresh token
    generateRefreshToken: (user) =>{
        return jwt.sign({
            id: user.id,
            admin: user.admin,
        },
        process.env.REFRESH_KEY,
        {expiresIn:"365d"}
        );
    },
    
    //login
    loginUser: async(req,res) => {
        try{
            const user = await User.findOne({username: req.body.username});
            if(!user){
                res.staus(404).json("sai ten dang nhap!");
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            ); //so sanh password tren database
            if(!validPassword){
                res.status(404).json("sai mat khau!");
            }
            if(user && validPassword){
                const accessToken = authController.generateAccessToken(user);
                // const accessToken = jwt.sign({
                //     id: user.id,
                //     admin: user.admin
                // },
                // process.env.PRIVATE_KEY,
                // {
                //     expiresIn: "60s"
                // }
                // );
                const refreshToken = authController.generateRefreshToken(user);
                // const refreshToken = jwt.sign({
                //     id: user.id,
                //     admin: user.admin
                // },
                // process.env.REFRESH_KEY,
                // {
                //     expiresIn: "365d"
                // }
                // );
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                })

                const {password, ...others} = user._doc;// an password
                res.status(200).json({...others, accessToken});
            }

        }catch(err){
            res.status(500).json(err);
        }
    },

    requestRefreshToken: async(req,res) =>{
        //take refresh token from user
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken) return res.status(401).json("you're not authecation");
        if(!refreshTokens.includes(refreshToken)){
            return res.status(403).json("refresh token is not vaild");
        }
        jwt.verify(refreshToken,process.env.REFRESH_KEY, (err,user) =>{
            if(err){
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            //create
            const newAccessToken =  authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.status(200).json({accessToken: newAccessToken});
        });
    },


    //log out
    userLogout :async(req,res) =>{
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        return res.status(200).json("logged out");
    }
};

module.exports = authController;