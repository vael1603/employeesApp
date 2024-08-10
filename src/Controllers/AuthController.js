import Jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { JWT_SECRET, JWT_EXPIRES, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } from '../config.js';
import { ModelToken } from '../Middleware/Auth.js';
import { text } from 'express';
import { createEmail } from '../utils.js';


/* We declare the type of data that our users' collection has in Mongo DB */
const schema = new mongoose.Schema({
    name: String,
    lastName: String,
    email: String,
    password: String,
    group: String
}, {versionKey:false})

const modelUser = new mongoose.model('users', schema);

/* Check if all the data is not empty*/
const validateUser = (name, lastName, email, password, group ) => { 
    var errors = [];
    if(name === undefined || name.trim() === '') {
        errors.push('El Nombre no debe estar vacio');
    }
    if(lastName === undefined || lastName.trim() === '') {
        errors.push('El Apellido no debe estar vacio');
    }
    if(email === undefined || email.trim() === '') {
        errors.push('El Correo electronico no debe estar vacio');
    }
    if(password === undefined || password.trim() === '' || password.length < 8){
        errors.push('La Contraseña no debe estar vacia y debe tener minimo 8 caracteres');
    }
    if(group === undefined || group.trim() === ''){
        errors.push('El Grupo no debe estar vacio');
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
            const newUser = new modelUser({
                    name: name,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    group: group
            });
            await newUser.save();
            
            return res.status(200).json({
                    status: true,
                    message: 'Usuario Creado'
            });
        } else {
            // if any parameter has an error it return a 400 error with a description
            return res.status(400).json({
                status: false,
                message: validation
            });
        }
    } catch (error) {
        // if something not related with the parameters failes it return a 500 error with the message 
        return res.status(500).json({
            status: false,
            message: [error.message]
        });
    }
}

export const login = async(req, res) => {
    try{
        const {email, password} = req.body
        const info = await modelUser.findOne({email: email})
        const isPasswordCorrect = await bcryptjs.compare(password, info.password)
        
        if(info.length == 0 || !isPasswordCorrect) {
            return res.status(404).json({
                status: false,
                errors:['Usuario o Contraseña Incorrecta']
            })
        }
        const token = Jwt.sign(
            {data: info}, // creates the token using ID, the email and the data of the user
            JWT_SECRET, {expiresIn: JWT_EXPIRES}
        )

        // Returns the user data detail
        const user = {id: info._id, name: info.name, lastname: info.lastName, email: info.email, token: token}
        
        return res.status(200).json({
            status: true,
            data: user,
            message: 'Sesion Iniciada'
        })
    } catch (error){
        // if something not related with the parameters failes it return a 500 error with the message 
        return res.status(500).json({
            status: false,
            message: [error.message]
        });
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
                return res.status(200).json({
                    status: true,
                    message: 'Su sesion ha finalizado'
                })
            } else {
                // if any parameter has an error it return a 400 error with a description
                return res.status(401).json({
                    status: false,
                    message: 'No Autorizado'
                });
            }
        }
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: [error.message]
        });
    }
}

export const passwordRecover = async(req, res) => {
    const {email} = req.body

    if(email === undefined || email.trim() === '') {
        return res.status(400).json({
                status: false,
                message: 'El correo no puede estar vacio'
            });
    } else {
        const user = await modelUser.findOne({email: email})
        if(user.length == 0 || !isPasswordCorrect) {
            return res.status(404).json({
                status: false,
                errors:['Usuario inexistente']
            })
        }
        const token = Jwt.sign(
            {data: user}, // creates a diferent token to recover the password
            JWT_SECRET_PASSWORD_RECOVER, {expiresIn: JWT_EXPIRES}
        )

        const email = {
            from: 'EmployeeApp',
            to: user.email,
            subject: 'Recupera tu contraseña',
            text: `Hola ${user.name} ${user.lastName} para recuperar tu contraseña hace click en el boton de abajo`,
            html: `
                <button>click me</button>
            `
        }

        createEmail(email).then( (data) => {            
            if(data.status) {
                res.status(200).json({
                    status: true,
                    message: 'Se ha enviado un correo electronico a tu casilla para que recuperes tu contraseña'
                })
            } else {
                res.status(400).json(data)
            }
        })
    }
}