const express = require('express')
const router = express.Router()
var multer  = require('multer');
/////////////////////////// controllers ///////////////////////

const DocumentosController = require("../controllers/DocumentosController");

router.get("/",(peticion,respuesta)=>{
    respuesta.send('https://grupoboletindeltrabajo-b871d.web.app/');
})

/////////////////////// portal de soluciones ///////////////////
router.get("/documento/:area",DocumentosController.documentos);
router.get("/documentos/:id",DocumentosController.documentosdetalles);

/*router.post("/calculo-finiquito",FiniquitoController.calculo);
router.post("/carta-finiquito",FiniquitoController.cartaAviso);
router.post("/generar-finiquito",FiniquitoController.finiquito);/*/

module.exports = router