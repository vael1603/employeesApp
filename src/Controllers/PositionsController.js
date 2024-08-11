const positionAPI = 'https://ibillboard.com/api/positions'

export const getPositions = async(req, res) => {
    try {
        fetch(positionAPI).then(response => response.json())
            .then( (response) =>{
                return res.status(200).json({
                    status: true,
                    message: 'Posiciones obtenidas exitosamente',
                    data: response
                })
            })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: [error.message]
        });
    }
}