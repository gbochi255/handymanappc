import { createUser, getUserByEmail, getUserById, updateUser, deleteUser } from '../models/userModel.js';
//const userModel = require('../models/userModel')
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;


    export async function register(req, res, next){
        try{
            const user = await  createUser(req.body);
            res.status(201).json(user);
        }catch(err){
            next(err)
        }
    }
    
    export async function login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await getUserByEmail(email);
            if(!user || user.password !== password) {
                throw Object.assign(new Error("Invalid credentials"), { status: 401 });
            }
            const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: "ihr" });
            res.json({ user, token });
        }catch(err) {
            next(err);
        }
    }
    
    export async function getProfile(req, res, next) {
        try{
            const user = await getUserById(Number(req.params.id));
            if(!user) throw Object.assign(new Error("User not found"), {status:404});
             res.json(user);
            
        }catch(err) {
            next(err);
        }
    }
    export async function patchProfile(req, res, next) {
        try{
        const user = await updateUser(Number(req.params.id), req.body);
        res.json(user);
    }catch(err){
        next(err);
    }
    }
    export async function deleteProfile(req, res, next) {
        try{
            await deleteUser(Number(req.params.id));
            res.status(204).end();
        }catch(err) {
            next(err)
        }
    }
