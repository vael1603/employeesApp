import mongoose from "mongoose";
import * as fs from 'fs'
import { error } from "console";
import { resHandler } from "../utils.js";

const schema = new mongoose.Schema({
    name: String,
    lastname: String,
    birthDay: String,
    jobPosition: String
},{versionKey:false})

const ModelEmployees = new mongoose.model('employees', schema)

/* Check if all the data is not empty*/
const validateEmployee = (name, lastname, birthDay, jobPosition) => { 
    var errors = [];
    if(name === undefined || name.trim() === '') {
        errors.push('Name cannot be empty');
    }
    if(lastname === undefined || lastname.trim() === '') {
        errors.push('Lastname cannot be empty');
    }
    if(birthDay === undefined || birthDay.trim() === '') {
        errors.push('Birthday cannot be empty');
    }
    if(jobPosition === undefined || jobPosition.trim() === '') {
        errors.push('job position cannot be empty');
    }
    return errors
}

export const getEmployees = async(req, res) => {
    try {
        const {id} = req.params
        const rows = (id === undefined) ? await ModelEmployees.find() : await ModelEmployees.findById(id)
        return resHandler(res, 200, 'Employee/s successfully obtained', rows)

    } catch(error) {
        return resHandler(res, 500, error.message)
    }
}

export const createNewEmployee = async(req, res) => {
    try {
        const { name, lastname, birthDay, jobPosition } = req.body
        let validation = validateEmployee(name, lastname, birthDay, jobPosition)

        if(validation == '') {
            const newEmployee = await new ModelEmployees({
                name: name,
                lastname: lastname,
                birthDay: birthDay,
                jobPosition: jobPosition
            })

            return await newEmployee.save().then( (savedItem) => {
                return resHandler(res, 200, 'Employee Created', savedItem)
            }) 
        } else {
            // if any parameter has an error it return a 400 error with a description
            return resHandler(res, 400, validation)
        }

    } catch(error) {
        return resHandler(res, 500, error.message)
    }
}

export const updateEmployee = async(req, res) => {
    try {
        const { id } = req.params
        const { name, lastname, birthDay, jobPosition } = req.body
        const newValues = {
            name: name,
            lastname: lastname,
            birthDay: birthDay,
            jobPosition: jobPosition
        }

        let validation = validateEmployee(name, lastname, birthDay, jobPosition)
        if(validation == '') {
            return await ModelEmployees.updateOne({_id: id}, {$set: newValues}).then( () => {
                resHandler(res, 200, "Employee's data updated")
            }) 
        } else {
            // if any parameter has an error it return a 400 error with a description
            return resHandler(res, 400, validation)
        }

    } catch(error) {
        return resHandler(res, 500, error.message)
    }
}

export const deleteEmployee = async(req, res) => {
    try {
        const {id} = req.params
        await ModelEmployees.deleteOne({_id: id})
        return resHandler(res, 200, 'Employee deleted')
    } catch(error) {
        return resHandler(res, 500, error.message)
    }
}