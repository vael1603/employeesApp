import Jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { JWT_SECRET, JWT_EXPIRES } from '../config.js';


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
        
    } catch (error){

    }
}
