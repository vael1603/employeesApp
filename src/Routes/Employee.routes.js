import { Router } from 'express'
import { createNewEmployee, deleteEmployee, getEmployees, updateEmployee } from '../Controllers/EmployeeController.js'
import { verify } from '../Middleware/Auth.js'

const employeeRoutes = Router()

employeeRoutes.post('/api/employees/create', verify, createNewEmployee)
employeeRoutes.get('/api/employees', getEmployees)
employeeRoutes.get('/api/employees/:id', getEmployees)
employeeRoutes.put('/api/employees/:id', verify, updateEmployee)
employeeRoutes.delete('/api/employees/:id', verify, deleteEmployee)

export default employeeRoutes