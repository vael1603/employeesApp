import { Router } from 'express'
import Jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import mongoose from 'mongoose'

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

const ModelLogRegister = new mongoose.model('logRegister', logSchema)

export const verify = Router()

verify.use( async(req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']
    if(!token) {
        return res.status(401).json({
            status:false, errors:['No estas Autorizado']
        })
    }
    if(token.startsWith('Bearer')) {
        token = token.slice(7, token.length)
        const isTokenInBlacklist = await ModelToken.find({token: token})
        if(isTokenInBlacklist.length == 0) {
            Jwt.verify(token, JWT_SECRET, async(error, decoded) => {
                if(error) {
                    return res.status(401).json({status: false, errors: ['Token No válido']})
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
            return res.status(401).json({status: false, errors: ['Token No válido']})
        }
    } else {
        return res.status(401).json({status: false, errors: ['Token No válido']})
    }
})