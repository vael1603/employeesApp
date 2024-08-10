import mongoose from "mongoose";
import * as fs from 'fs'
import { error } from "console";

const schema = new mongoose.Schema({
    name: String,
    lastName: String,
    birthDay: String,
    jobPosition: String
},{versionKey:false})

const ModelEmployees = new mongoose.model('employees', schema)

/* Check if all the data is not empty*/
const validateEmployee = (name, lastName, birthDay, jobPosition) => { 
    var errors = [];
    if(name === undefined || name.trim() === '') {
        errors.push('El Nombre no debe estar vacio');
    }
    if(lastName === undefined || lastName.trim() === '') {
        errors.push('El Apellido no debe estar vacio');
    }
    if(birthDay === undefined || birthDay.trim() === '') {
        errors.push('La Fecha de Nacimiento no debe estar vacia');
    }
    if(jobPosition === undefined || jobPosition.trim() === '') {
        errors.push('El Puesto de trabajo no debe estar vacio');
    }
    return errors
}

export const getEmployees = async(req, res) => {
    try {
        const {id} = req.params
        const rows = (id === undefined) ? await ModelEmployees.find() : await ModelEmployees.findById(id)
        return res.status(200).json({status: true, data: rows})

    } catch(error) {
        return res.status(500).json({status: false, errors: [error]})
    }
}

export const createNewEmployee = async(req, res) => {
    try {
        const { name, lastName, birthDay, jobPosition } = req.body
        let validation = validateEmployee(name, lastName, birthDay, jobPosition)

        if(validation == '') {
            const newEmployee = await new ModelEmployees({
                name: name,
                lastName: lastName,
                birthDay: birthDay,
                jobPosition: jobPosition
            })
            console.log('TESTING')
            return await newEmployee.save().then( () => {
                console.log('lalala')
                res.status(200).json({
                    status: true,
                    message: 'Empleado Creado'
                });
            }) 
        } else {
            // if any parameter has an error it return a 400 error with a description
            return res.status(400).json({
                status: false,
                message: validation
            });
        }

    } catch(error) {
        return res.status(500).json({
            status: false,
            errors: [error]
        });
    }
}

export const updateEmployee = async(req, res) => {
    try {
        const { id } = req.params
        const { name, lastName, birthDay, jobPosition } = req.body
        const newValues = {
            name: name,
            lastName: lastName,
            birthDay: birthDay,
            jobPosition: jobPosition
        }

        let validation = validateEmployee(name, lastName, birthDay, jobPosition)
        if(validation == '') {
            return await ModelEmployees.updateOne({_id: id}, {$set: newValues}).then( () => {
                res.status(200).json({
                    status: true,
                    message: 'Datos de Empleado actualizados'
                });
            }) 
        } else {
            // if any parameter has an error it return a 400 error with a description
            return res.status(400).json({
                status: false,
                message: validation
            });
        }

    } catch(error) {
        return res.status(500).json({
            status: false,
            errors: [error.message]
        });
    }
}

export const deleteEmployee = async(req, res) => {
    try {
        const {id} = req.params
        await ModelEmployees.deleteOne({_id: id})
        return res.status(200).json({status: true, message: 'Empleado Eliminado'})
    } catch {
        return res.status(500).json({status: false, errors: [error.message]})
    }
}