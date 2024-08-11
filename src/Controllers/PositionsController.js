const positionAPI = 'https://ibillboard.com/api/positions'
import { resHandler } from "../utils.js";

export const getPositions = async(req, res) => {
    try {
        fetch(positionAPI).then(response => response.json())
            .then( (response) =>{
                return resHandler(res, 200, 'positions successfully obtained', response)
            })
    } catch (error) {
        return resHandler(res, 500, error.message)
    }
}