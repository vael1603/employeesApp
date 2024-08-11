import { Router } from 'express';
import Jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_SECRET } from '../config.js';
import { resHandler } from "../utils.js";

const tokenSchema = new mongoose.Schema({
    token: String,
}, {versionKey:false})

export const ModelToken = new mongoose.model('blacklist', tokenSchema);


const logSchema = new mongoose.Schema({
    api: String,
    method: String,
    params: {},
    bodyParams: {},
    dateTime: Date,
    userDetails: {}
})

export const ModelLogRegister = new mongoose.model('logRegister', logSchema)

export const verify = Router()

verify.use( async(req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']
    if(!token) {
        return resHandler(res, 401, 'Not Authorized')
    }
    if(token.startsWith('Bearer')) {
        token = token.slice(7, token.length)
        const isTokenInBlacklist = await ModelToken.find({token: token})
        if(isTokenInBlacklist.length == 0) {
            Jwt.verify(token, JWT_SECRET, async(error, decoded) => {
                if(error) {
                    return resHandler(res, 401, 'Invalid Token')
                } else {
                    req.decode = decoded
                    // We Save all the calls to the api in MONGO
                    const newLogRegister = new ModelLogRegister({
                        api: req.url,
                        method: req.method,
                        params: req.params,
                        bodyParams: req.body,
                        dateTime: new Date(),
                        userDetails: decoded.data
                    })
                    await newLogRegister.save()
                    //once saved the log register we executed the functionController
                    next()
                }
            })
        } else {
            return resHandler(res, 401, 'Invalid Token')
        }
    } else {
        return resHandler(res, 401, 'Invalid Token')
    }
})