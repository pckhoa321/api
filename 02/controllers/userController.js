const User = require("../models/User");

const userController = {
    //get all users
    getAllusers: async(req, res) => {
        try{
            const user = await User.find();
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
    },

    //delete user
    deleteUser: async(req, res) => {
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("xoa thanh cong");
        }catch(err){
            res.status(500).json(err);
        }
    }
}

module.exports = userController;