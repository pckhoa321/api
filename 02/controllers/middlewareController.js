const jwt = require("jsonwebtoken");

const middlewareController = {

    //verifyToken
    verifyToken: (req,res,next) => {
        const token = req.headers.token;
        if(token){
            //bearer
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.PRIVATE_KEY,(err,user) =>{
                if(err){
                  return  res.status(403).json("token is not vaild");
                }
                req.user = user;
                next();
            });
        }
        else{
             return res.status(401).json("you're not authenticated");
        }
    },

    verifyTokenAndAdminAuth : (req,res,next) =>{
        middlewareController.verifyToken(req, res, () =>{
            if(req.user.id == req.params.id || req.params.admin){
                next();
            }
            else{
               return res.status(403).json("you're not allowed to delete other");
            }
        });
    },
};

module.exports = middlewareController;