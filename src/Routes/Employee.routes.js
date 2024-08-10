import { Router } from 'express'
import { createNewEmployee, deleteEmployee, getEmployees, updateEmployee } from '../Controllers/EmployeeController.js'

const employeeRoutes = Router()

employeeRoutes.post('/api/employees/create', createNewEmployee)
employeeRoutes.get('/api/employees', getEmployees)
employeeRoutes.get('/api/employees/:id', getEmployees)
employeeRoutes.put('/api/employees/:id', updateEmployee)
employeeRoutes.delete('/api/employees/:id', deleteEmployee)

export default employeeRoutes