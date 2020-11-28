const express = require('express')
const router = express.Router()


router.get("/",(peticion,respuesta)=>{
    respuesta.send('https://grupoboletindeltrabajo-b871d.web.app/');
})


module.exports = router