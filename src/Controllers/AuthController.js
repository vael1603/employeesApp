import bcryptjs from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_EXPIRES, JWT_SECRET, JWT_SECRET_PASSWORD_RECOVER } from '../config.js';
import { ModelToken } from '../Middleware/Auth.js';
import { createEmail, resHandler } from '../utils.js';
import { ModelLogRegister } from '../Middleware/Auth.js';


/* We declare the type of data that our users' collection has in Mongo DB */
const schema = new mongoose.Schema({
    name: String,
    lastName: String,
    email: String,
    password: String,
    group: String
}, {versionKey:false})

const ModelUser = new mongoose.model('users', schema);

/* Check if all the data is not empty*/
const validateUser = (name, lastName, email, password, group ) => { 
    var errors = [];
    if(name === undefined || name.trim() === '') {
        errors.push('Name cannot be empty');
    }
    if(lastName === undefined || lastName.trim() === '') {
        errors.push('Lastname cannot be empty');
    }
    if(email === undefined || email.trim() === '') {
        errors.push('email cannot be empty');
    }
    if(password === undefined || password.trim() === '' || password.length < 8){
        errors.push('Password cannot be empty and should has 8 characters at least');
    }
    if(group === undefined || group.trim() === ''){
        errors.push('the group cannot be empty');
    }
    return errors
}

/* Creates a new User*/
export const createUser = async(req, res) => {
    try {
        const {name, lastName, email, password, group} = req.body;
        let validation = validateUser(name, lastName, email, password, group)

        // we check if all the parameters are correct
        if(validation == '') {
            let hashedPassword = await bcryptjs.hash(password,8);
            const newUser = new ModelUser({
                    name: name,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    group: group
            });
            const savedItem = await newUser.save();
            
            return resHandler(res, 200, 'User Created', savedItem)
        } else {
            // if any parameter has an error it return a 400 error with a description
            return resHandler(res, 400, validation)
        }
    } catch (error) {
        // if something not related with the parameters failes it return a 500 error with the message 
        return resHandler(res, 500, error.message)
    }
}

export const login = async(req, res) => {
    try{
        const {email, password} = req.body
        const info = await ModelUser.findOne({email: email})
        const isPasswordCorrect = await bcryptjs.compare(password, info.password)
        
        if(info.length == 0 || !isPasswordCorrect) {
            return resHandler(res, 404, 'User or password incorrect')
        }
        const token = Jwt.sign(
            {data: info}, // creates the token using ID, the email and the data of the user
            JWT_SECRET, {expiresIn: JWT_EXPIRES}
        )

        // Returns the user data detail
        const user = {id: info._id, name: info.name, lastname: info.lastName, email: info.email, token: token}
        
        return resHandler(res, 200, 'Session Initialized', user)
    } catch (error){
        // if something not related with the parameters failes it return a 500 error with the message 
        return resHandler(res, 500, error.message)
    }
}

export const logout = async(req, res) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']
        if(token.startsWith('Bearer')) {
            token = token.slice(7, token.length)
            if(Jwt.verify(token, JWT_SECRET)) {
                const invalidToken = new ModelToken({ token: token})
                
                await invalidToken.save()
                return resHandler(res, 200, 'Your session has ended')
            } else {
                // if any parameter has an error it return a 400 error with a description
                return resHandler(res, 401, 'Not Authorized')
            }
        }
        
    } catch (error) {
        return resHandler(res, 500, error.message)
    }
}

export const passwordRecover = async(req, res) => {
    try {
        
        const {email} = req.body
        
        if(email === undefined || email.trim() === '') {
            return resHandler(res, 400, "Email can't be empty")
        } else {
            const user = await ModelUser.findOne({email: email})
            if(!user) {
                return resHandler(res, 404, "the user doesn't exist ")
            }
            const token = Jwt.sign(
                {data: user}, // creates a diferent token to recover the password
                JWT_SECRET_PASSWORD_RECOVER, {expiresIn: JWT_EXPIRES}
            )
            
            const emailTemplate = {
                from: 'EmployeeApp',
                to: user.email,
                subject: 'Employee App: please recover your password',
                html: `
                    <strong> HI ${user.name} ${user.lastName} We received your request to update your password.</strong>
                    <br/>
                    Please copy the token and paste on the app with your new password.
                    <br/>
                    <br/>
                    <strong>TOKEN: </strong> ${token}
                `
            }
            
            const emailResponse = await createEmail(emailTemplate)
            
            if(emailResponse.status) {
                return resHandler(res, 200, `We have sent you an email to ${user.email} to recover your password`)
            } else {
                return resHandler(res, 400, emailResponse.message)
            }
        }
    } catch (error) {
        return resHandler(res, 500, error.message)
    }
}
    
export const updatePassword = async(req, res) => { 
    try {    
        //receive the new password and the token
        const {password} = req.body
        const {token} = req.params
        
        //Validates the new password
        if(password === undefined || password.trim() === '' || password.length < 8){
            return resHandler(res, 400, 'Password cannot be empty and should has 8 characters at least')
        }

        //check if is an old token of the blacklist
        const isTokenInBlacklist = await ModelToken.find({token: token})
        if(isTokenInBlacklist.length == 0) {

            //Validate token
            Jwt.verify(token, JWT_SECRET_PASSWORD_RECOVER, async(error,decode) => {
                if(error) {
                    return resHandler(res, 401, 'Invalid Token')
                } else {
                    let userUpdated = decode.data
                    userUpdated.password = await bcryptjs.hash(password,8); // Hash the new password
                    
                    // We Save the call in MONGO
                    const newLogRegister = new ModelLogRegister({
                        api: req.url,
                        method: req.method,
                        params: req.params,
                        bodyParams: req.body,
                        dateTime: new Date(),
                        userDetails: decode.data
                    })
                    await newLogRegister.save()
                    
                    //once saved in the log register we update the password
                    return await ModelUser.updateOne({_id: userUpdated._id}, {$set: userUpdated}).then( async() => {
                        
                        //We save the token on the blaklist to not be re used
                        const invalidToken = new ModelToken({ token: token})
                        await invalidToken.save()

                        return resHandler(res, 200, 'Your password has been updated')
                    }) 
                }
            })
        } else {
            return resHandler(res, 401, 'Invalid Token')
        }
    } catch (error) {
        return resHandler(res, 500, error.message)
    }
}