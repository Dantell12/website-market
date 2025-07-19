import { RequestHandler } from "express"
import jwt from "jsonwebtoken"
const SECRET_KEY = process.env.SECRET_KEY|| 'pepito123';
const validateToken: RequestHandler = (req, res, next) => {
    const headerToken = req.headers['authorization'];
    if (headerToken != undefined && headerToken.startsWith('Bearer ')) {
        // Tiene token
        try {
            const bearerToken = headerToken.slice(7);
            jwt.verify(bearerToken, SECRET_KEY || 'pepito123');
            next()
        } catch (error) {
            res.status(401).json({
                msg: 'Token no valido'
            })
        }
//No tiene token
    } else {
        res.status(401).json({
            msg: 'Acceso denegado'
        })
    }
}

export default validateToken;