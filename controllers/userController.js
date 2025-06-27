const userModel = require('../models/userModel')

module.exports = {
    async register(req, res, next){
        try{
            const userData = req.body;
            const { error } = validateUser(userData);
            if (error) return res.status(400).json({ error: error.details[0].message });
            const user = await userModel.createUser(userData);
            res.status(201).json(user);
        }catch(err){
            next(err)
        }
    },
    async getProfile(req, res, next) {
        try{
            const user = await userModel.getUserById(req.params.id);
            if(!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        }catch(err) {
            next(err);
        }
    },
    async updateProfile(req, res, next) {
        try{
        const updates = req.body;
        const user = await userModel.updateUser(requestAnimationFrame.params.id, updates);
        res.json(user);
    }catch(err){
        next(err);
    }
    },
    async deleteProfile(req, res, next) {
        try{
            await userModel.deleteUser(req.params.id);
            res.status(204).end();
        }catch(err) {
            next(err)
        }
    }
};