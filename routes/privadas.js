const express = require('express');
const router = express.Router();
const bodyParse = require('body-parser');
const jwt = require('jsonwebtoken');
var path = require('path')
const fs = require ('fs');

const User= require ('../models/User');
const Slider =require('../models/Slider');
const PopUps =require('../models/PopUps');
const Noticias=require('../models/Noticias');
const Eventos=require('../models/Eventos');
const Cursos=require('../models/Cursos');
const Contenidos=require('../models/Contenidos');
const SliderConfig=require('../models/SliderConfig');
const Newsletter=require('../models/Newsletter');
const pool=require('../config/dataBaseMYSQL');
const utf8=require('utf8');
//var admin = require('firebase-admin');
const { crearFichero,eliminarFichero,getMes } = require("../controllers/helpers");
var multer  = require('multer');
/// moment /////
var moment = require('moment');
moment.locale('es'); 

var serviceAccount = require("../grupoboletindeltrabajo-api-firebase-adminsdk-bogjp-c757cc6e4b.json");

/*admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:'https://grupoboletindeltrabajo-api.firebaseio.com'
});*/

//const db=admin.database();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

      if(file.fieldname=="slider"){
        url='../frontend/src/assets/storage/slider/';
      }
      if(file.fieldname=="temario"){
        url='../frontend/src/assets/storage/cursos/temario/';
      }
      if(file.fieldname=="portada"){
        url='../frontend/src/assets/storage/cursos/portada/'
      }
      if(file.fieldname=="popups"){
        url='../frontend/src/assets/storage/popups/'
      }
      if(file.fieldname=="noticiaportada"){
          url='../frontend/src/assets/storage/noticias/'
      }
      if(file.fieldname=="filedocumento" || file.fieldname=="portadadocumento"){
          url='../frontend/src/assets/storage/documentos/'
      }
      if(file.fieldname=="filenewsletter"){
        url='../frontend/src/assets/storage/newsletter/'
      }
      cb(null, url)
    },
    filename: function (req, file, cb) {
      cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
 })
   
var upload = multer({ storage: storage })

router.get('/admin/newsletter',async(req,res)=>{
    const nw=await Newsletter.find();
    if(nw.length > 0){
        return res.status(201).json(nw);
    }else{
        res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
    }
   
});


router.post('/admin/newsletter/registrar',upload.single('filenewsletter'),async(req,res)=>{
    const nw=req.body;
    
 
    const fch=nw.fecha.split('-');
   
    nw.dia=fch[2];
    nw.mes=getMes(parseInt(fch[1]));
    nw.anio=fch[0];
    ruta='';
    if(req.file){
        const filename=req.file.filename;
        ruta=`assets/storage/newsletter/${filename}`;
        nw.path=ruta;
    }else{
        
        ruta=`assets/storage/newsletter/filenewsletter-${Date.now()}.html`
        crearFichero('../frontend/src/'+ruta,nw.html);
        nw.path=ruta;
    }

    let newsletterModel = new Newsletter(nw);
   
    newsletterModel.save();

    return res.json({res:true});

});

router.put('/admin/newsletter/editar',upload.single('filenewsletter'),async(req,res)=>{
    const nw=req.body;
    const {id,area,fecha,titulo,html,url}=req.body;
 
    const fch=fecha.split('-');
   
    const dia=fch[2];
    const mes=getMes(parseInt(fch[1]));
    const anio=fch[0];
    ruta='';
    const path='';
    if(req.file){
        const filename=req.file.filename;
        ruta=`assets/storage/newsletter/${filename}`;
        console.log("Existe un file");
      
    }else{

        if(html!=''){
            ruta=`assets/storage/newsletter/filenewsletter-${Date.now()}.html`
            crearFichero('../frontend/src/'+ruta,nw.html);
            console.log("Existe un HTML");
        }else{
            ruta=url;
            console.log("No existe un file");
        }
        
      
    }
    console.log(ruta);
    path=ruta;
    const result=await Newsletter.findByIdAndUpdate(id,{area,dia,mes,anio,titulo,html,path,fecha});
    console.log(result);

    return res.json({res:true});

});

router.delete('/admin/newsletter/eliminar/:id',async(req,res)=>{
    const id=req.params.id;

    const nw=await Newsletter.findById(id);

    const fichero=`../frontend/src/assets/${nw.path}`;
    eliminarFichero(fichero);
    
    removerslider=await Newsletter.deleteOne({_id:id});

    res.json({"res":true});

});

router.get('/admin/documentos',async(req,res)=>{
    const contenidos=await Contenidos.find();
    
    if(contenidos.length > 0){
        res.status(201).json(contenidos);
    }else{
        res,status(404).send({errors:["No se encuentra esa Publicacíon"]});
    }
});


router.post('/admin/documentos/registrar',upload.array('filedocumento'),async(req,res)=>{
    const documentos = req.body;

    console.log(req.files);
   
    if(req.files){
        documento=[];
        req.files.forEach(element => {
            filename=element.filename;
            ruta=`assets/storage/documentos/${filename}`;
            documento.push({
                "url":ruta
            });
        });

        documentos.documento=documento;
    }

    let contenidosModel = new Contenidos(documentos);
   
    const resp=contenidosModel.save();
    console.log(resp);

    res.json({"res":true});

})

router.put("/admin/documentos/editar",upload.fields([{name:'filedocumento', maxCount: 8 },{name:'portadadocumento',maxCount:1}]),async(req,res)=>{
    const documentos=req.body;
    const id=req.body.id,
    categoria=req.body.categoria,
    area=req.body.area,
    tema=req.body.tema,
    tipo=req.body.tipo!='undefined' ? req.body.tipo : '',
    subtipos=req.body.subtipo!='undefined' ? req.body.subtipo : '',
    titulo=req.body.titulo,
    descripcion=req.body.descripcion!='undefined' ? req.body.descripcion : '',
    contenido=req.body.contenido!='undefined' ? req.body.contenido : '',
    enlace=req.body.enlace!='undefined' ? req.body.enlace : '',
    video=req.body.video!='undefined' ? req.body.video : '',
    audio=req.body.audio!='undefined' ? req.body.audio : '',
    issuu=req.body.issuu!='undefined' ? req.body.issuu : '',
    embed=req.body.embed!='undefined' ? req.body.embed : '',
    urldocum=req.body.urldocum;


    documento=[];
    subtipo=[];

    if(subtipos!=null){
      
        if(Array.isArray(documentos.subtipo)){

            subtipos.forEach(element=>{
                subtipo.push({
                    label:element
                })
            })
            
        }else{
    
            subtipo.push({
                label:subtipos
            })

        }

    }


    console.log(req.files.filedocumento);


    if(req.files.filedocumento.length > 0){
        console.log(req.files);

        req.files.filedocumento.forEach(element => {
            filename=element.filename;
            ruta=`assets/storage/documentos/${filename}`;
            documento.push({
                "url":ruta
            });
        });
    }else{

        if(Array.isArray(documentos.urldocum)){

            documentos.urldocum.forEach(element=>{
                documento.push({
                    "url":element
                });
            })

        }else{
            documento.push({
                "url":documentos.urldocum
            });
        }
        
    }


    if(req.files.portadadocumento.length > 0){
        filenamedocumento=req.files.portadadocumento[0].filename;
        portada=`assets/storage/documentos/${filenamedocumento}`;
    }else{
        portada=req.body.urlportada;
    }

    const updatedContenido = await Contenidos.findByIdAndUpdate(id,{categoria,area,tema,tipo,subtipo,titulo,descripcion,contenido,enlace,video,audio,embed,documento,portada});
    console.log(updatedContenido);
    res.json({"res":true});

});

router.delete("/admin/documentos/eliminar/:id",async(req,res)=>{
  const id=req.params.id;
  const resp=await Contenidos.deleteOne({_id:id});
  
  res.json({"resp":true,"id":id});

});

router.get('/admin/popups',async(req,res)=>{
    const popups=await PopUps.find();

    if(popups.length > 0){
        res.status(201).json(popups);
    }else{
        res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
    }

});
router.post("/admin/popups/registrar",upload.single('popups'),async(req,res)=>{
    const popups=req.body;

    const ordenultimo=await PopUps.find({},{orden:1}).limit(1).sort({_id:-1});
    

    if(ordenultimo.length > 0){
        orden=ordenultimo[0].orden+1;
    }else{
        orden=1;
    }

    popups.orden=orden;
   
    if(req.file){
        const filename=req.file.filename;
        const ruta=`assets/storage/popups/${filename}`;
        popups.imgpopups=ruta;
    }

    let popupsModel = new PopUps(popups);
   
    popupsModel.save();

    return res.json({res:2});
});


router.put("/admin/popups/editar",upload.single('popups'),async(req,res)=>{
    const id=req.body.id;
    const titulo=req.body.titulo ? req.body.titulo : '';
    const enlace=req.body.enlace ? req.body.enlace : '';
    const contenido=req.body.contenido ? req.body.contenido : '';
    const background=req.body.background ? req.body.background : '';
    var orden=req.body.orden;
    const ordenan=req.body.ordenanterior;
    const estado=req.body.estado;

    if(req.file){
        imgpopups=`assets/storage/popups/${filename}`
    }else{
        imgpopups=req.body.urlimg;
    }
    
    const ordenotroitem=await PopUps.find({orden:orden},{_id:1,orden:1});

    if(ordenotroitem.length > 0){
        idotroitem=ordenotroitem[0]._id;
    }
    const updatedPopUps = await PopUps.findByIdAndUpdate(id,{titulo,enlace,contenido,background,orden,imgpopups,estado});
    orden=ordenan;
    result=await PopUps.findByIdAndUpdate(idotroitem,{orden});
    return res.json({res:true});
});

router.delete('/popups/eliminar/:id',async(req,res)=>{
    const id=req.params.id;
    await PopUps.deleteOne({_id:id});
    res.json({"res":true});
});

router.get('/admin/sliderconfig/:area',async(req,res)=>{
    const area=req.params.area;
    const config=await SliderConfig.find({area:area});

    if(config.length > 0){
        return res.status(200).json(config);
    }else{
        return res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
    }
});


router.post('/admin/sliderconfig/registrar',async(req,res)=>{
    const value=req.body;

    let sliderModel = new SliderConfig(value);
    sliderModel.save()
   
    res.json({res:"prueba"});
})

router.get('/admin/slider',async(req,res)=>{

    const carousel= await Slider.find().sort({orden:1});

    if(Slider){
        res.json(carousel);
    }else{
        return res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
    } 

});


router.post("/admin/slider/registrar",upload.single('slider'),async(req,res)=>{
    const slider=req.body;
   
   
    const carousel= await Slider.find({area:slider.area}).sort({orden:-1}).limit(1);
   

    if(req.file){
        const filename=req.file.filename;
        const ruta=`assets/storage/slider/${filename}`;
        slider.slider=ruta;
    }
   
    if(carousel.length > 0){
        slider.orden=carousel[0].orden+1;
    }else{
        slider.orden=1;
    }

    let sliderModel = new Slider(slider);
   
    sliderModel.save();

    return res.json({res:1});
});

router.put('/admin/slider/editar',async(req,res)=>{
   
    const slider=req.body;

    slider.forEach (async element=>{
        id=element._id;
        orden=element.orden;
        estado=element.estado;
      
       result=await Slider.findByIdAndUpdate(id,{orden,estado});
    });
   
    res.json({res:"hola"});
});

router.delete('/admin/slider/eliminar/:id',async(req,res)=>{
    const id=req.params.id;

    const slider=await Slider.findById(id,{slider:1});
   
    const fichero=`../frontend/src/${slider.slider}`;
    eliminarFichero(fichero);
  
    removerslider=await Slider.deleteOne({_id:id});

    res.json({"res":true});
});

router.put('/admin/slider/editar/:id',upload.single('slider'),async(req,res)=>{
    const id=req.params.id;
    const area=(req.body.area) ? req.body.area: null;
    const posicioncaption=(req.body.posicioncaption) ? req.body.posicioncaption : null;
    const animacion=(req.body.animacion) ? req.body.animacion : null;
    const titulo=(req.body.titulo) ? req.body.titulo : null;
    const bgtitulo=(req.body.bgtitulo) ? req.body.bgtitulo : null;
    const colortitulo=(req.body.colortitulo) ? req.body.colortitulo : null;
    const link=(req.body.link) ? req.body.link : null;
    const descripcion=(req.body.descripcion) ? req.body.descripcion : null;
    const bgdescripcion=(req.body.bgdescripcion) ? req.body.bgdescripcion:null;
    const colordescripcion=(req.body.colordescripcion) ? req.body.colordescripcion:null;
    const animaciondescripcion=(req.body.animaciondescripcion) ? req.body.animaciondescripcion:null;
    const titulobtn=(req.body.titulobtn) ? req.body.titulobtn:null;
    const bgbtn=(req.body.bgbtn) ? req.body.bgbtn:null;
    const colorbtn=(req.body.colorbtn) ? req.body.colorbtn:null;
    const animacionbtn=(req.body.animacionbtn) ? req.body.animacionbtn:null;
    const estado=(req.body.estado) ? req.body.estado:null;
 
    if(req.file){
        const filename=req.file.filename;
        slider=`assets/storage/slider/${filename}`;
    }else{
        slider=req.body.urlslider;
    }
    

    const updatedSlider = await Slider.findByIdAndUpdate(id,{area,posicioncaption,animacion,titulo,bgtitulo,colortitulo,link,descripcion,bgdescripcion,colordescripcion,animaciondescripcion,titulobtn,bgbtn,colorbtn,animacionbtn,estado,slider});

    res.json(updatedSlider);
});



router.get('/admin',(peticion,respuesta)=>{

    pool.getConnection((error,conexion)=>{
        const consulta=`SELECT * FROM usuario`
        conexion.query(consulta,(error,filas,campos)=>{
        
            respuesta.send(filas)
        })
        
    })
})
router.get('/admin/eventos/',async(req,res)=>{
    const event=await Eventos.find();
  

    if(event){
        res.json(event);
    }else{
        res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
    }

    
});



router.delete('/admin/eventos/eliminar/:id',async(req,res)=>{
    const id=req.params.id;
    
    const removerevento=await Eventos.deleteOne({_id:id});

    res.json([{"res":true,"mensaje":"evento eliminado"}]);
});


router.post('/admin/eventos/agregar',async(req,res)=>{
    console.log(req.body);
    const consulta= await Cursos.findById(req.body.id,{tituloLargo:1,area:1,_id:1});
    console.log(consulta);

    if(consulta.area=="Laboral"){
        color="#FF5733";
    }
    if(consulta.area=="Educacional"){
        color="#3EC#7C";
    }
    if(consulta.area=="Tributario"){
        color="#377dff";
    }
    if(consulta.area=="Salud"){
        color="#ec3047";
    }
    if(consulta.area=="RRHH"){
        color="#26cddc";
    }
    

    const eventos={
        id:req.body.id,
        title:consulta.tituloLargo,
        modalidad:req.body.modalidad,
        ubicacion:req.body.ubicacion,
        start:req.body.fechainicio,
        end:req.body.fechatermino,
        color:color,
        description:req.body.descripcion
      }
    const newEventos= new Eventos(eventos);
    const resp=await newEventos.save();
    return res.json(resp);
})


router.get("/admin/usuario",(peticion,respuesta)=>{


    pool.getConnection((error,conexion)=>{
        const consulta=`SELECT * FROM usuario`
        conexion.query(consulta,(error,filas,campos)=>{
            respuesta.send(filas);
        })
        
    })
   
  

})

router.post("/admin/usuario/registrar",async(peticion,respuesta)=>{
    const newUser = new User()
    await newUser.save();

    const toke = jwt.singn({_id: newUser._id},'secretKey')
    
    respuesta.status(200).json({token})

})

router.get("/admin/cursos",async(req,res)=>{
    const cursos=await Cursos.find();
    
    if(cursos){
        res.status(201).json(cursos);
    }else{
        res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
    }
});

router.post("/admin/cursos/registrar",upload.fields([{
    name: 'temario', maxCount: 1
  }, {
    name: 'portada', maxCount: 1
  }]),async(req,res)=>{
   
    let cursos=req.body;
    
    cursos.puntuacion=0;
    cursos.visita=0;
    cursos.estado=true;
    if(req.files){
        
        
        if(req.files.portada){
            rutaportadad=req.files.portada;
            cursos.portada = 'assets/storage/cursos/portada/'+rutaportadad[0].filename;
        }
        if(req.files.temario){
            rutatemario=req.files.temario;
            cursos.temario =  'assets/storage/cursos/temario/'+rutatemario[0].filename;
        }

        
       
    }
   
    let cursosModel = new Cursos(cursos);
   
    cursosModel.save();

    res.json("registro");

})

router.put("/admin/cursos/editar/:id",upload.fields([{
    name: 'temario', maxCount: 1
  }, {
    name: 'portada', maxCount: 1
  }]),async(req,res)=>{
    const id=req.params.id;
    console.log(id);
    const areaempresa=req.body.areaempresa,
    area=req.body.area,
    tipo=req.body.tipo,
    tituloLargo=req.body.tituloLargo,
    tituloCorto=req.body.tituloCorto,
    duracion=req.body.duracion,
    horas=req.body.horas,
    modalidad=req.body.modalidad,
    codigosence=req.body.codigosence,
    descripcion=req.body.descripcion,
    fundamentacion=req.body.fundamentacion,
    objetivogeneral=req.body.objetivogeneral,
    objetivoespecifico=req.body.objetivoespecifico,
    metodologia=req.body.metodologia,
    certificacion=req.body.certificacion,
    relator=req.body.relator,
    url=req.body.url;

    const cursos=req.body;
    modulos=[];
    console.log(areaempresa);
    var i=0;
    title=req.body.modulostitle;
    des=req.body.modulosdes;
 
    if(req.files){
      
        if(req.files.temario){
          var namet=req.files.temario[0].filename;
          temario=`assets/storage/cursos/temario/${namet}`;
        }else{
          temario=req.body.pathtemario;
        }
     
        if(req.files.portada){
            var name=req.files.portada[0].filename;
            portada=`assets/storage/cursos/portada/${name}`
        }else{
            portada=req.body.pathportada;
        }
  
      
    }
    if(des && title){
        for(i=0;i<des.length;i++){
            modulos.push({
                titulo:title[i],
                descripcion:des[i],
            });
        }
    }
    cursos.modulos = modulos;

    const updatedCursos = await Cursos.findByIdAndUpdate(id,{area,areaempresa,tipo,tituloLargo,tituloCorto,duracion,horas,modalidad,codigosence,descripcion,fundamentacion,objetivogeneral,objetivoespecifico,metodologia,certificacion,relator,temario,portada,url,modulos});
 
    res.json(updatedCursos);
})

router.delete("/admin/cursos/eliminar/:id",async(req,res)=>{
    const id=req.params.id;
 
    const cursos = await Cursos.findByIdAndRemove(id);

    if (cursos) {
      
        //await fs.unlink(path.resolve(photo.imagePath));
    }
  
    res.json({'res':true,'mensaje':'curso eliminados'});
})
router.get('/admin/cursos/respaldo',async(req,res)=>{

    pool.getConnection((error,conexion)=>{
        const consulta = `SELECT * FROM contenido c INNER JOIN modulos m ON c.id_cursos=m.id_cursos`


        conexion.query(consulta,(error,filas,campos)=>{
            if(filas.length > 0){
                cursos = []
                ultimoAutorId = undefined
                let portada;
                filas.forEach(registro => {
                    
                    if (registro.id_cursos != ultimoAutorId){
                        ultimoAutorId = registro.id_cursos
                        cursos.push({
                            id:registro.id_cursos,
                            area:registro.area,
                            tipo:registro.tipo,
                            tituloLargo:registro.titulo_largo ,
                            tituloCorto:registro.titulo_corto,
                            duracion:registro.duracion,
                            horas:registro.horas,
                            codigosence:registro.codigosence,
                            modalidad:registro.modalidad,
                            descripcion:registro.descripcion,
                            fundamentacion:registro.fundamentacion,
                            objetivogeneral:registro.objetivogeneral,
                            objetivoespecifico:registro.objetivoespecifico,
                            metodologia:registro.metodologia,
                            portada:registro.portada,
                            temario:registro.temario,
                            visita:registro.visita,
                            views:registro.views,
                            estado:true,
                            puntuacion:0,
                            modulos:[],
                            fecha:registro.fecha
                        })
                    }
                    cursos[cursos.length-1].modulos.push({
                        id: registro.id_cursos,
                        titulo: registro.titulo,
                        descripcion:registro.descripcionm
                    })
                  
                });

                promesa(cursos);

              
                return res.json({data:cursos})
             }else{
                return res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
             }

   
        })
    })
 
});

async function promesa(registro){
    
    const promesa=new Promise((resolve,reject)=>{
        if(registro.length>0){
            cursos;
            for(i=0;i<registro.length;i++){
                cursos={
                    id:registro[i].id_cursos,
                    area:registro[i].area,
                    tipo:registro[i].tipo,
                    tituloLargo:utf8.decode(registro[i].tituloLargo),
                    tituloCorto:utf8.decode(registro[i].tituloCorto),
                    duracion:registro[i].duracion,
                    horas:registro[i].horas,
                    codigosence:registro[i].codigosence,
                    modalidad:registro[i].modalidad,
                    descripcion:registro[i].descripcion,
                    fundamentacion:registro[i].fundamentacion,
                    objetivogeneral:registro[i].objetivogeneral,
                    objetivoespecifico:registro[i].objetivoespecifico,
                    metodologia:registro[i].metodologia,
                    portada:registro[i].portada,
                    temario:registro[i].temario,
                    visita:registro[i].visita,
                    views:registro[i].views,
                    estado:true,
                    puntuacion:0,
                    modulos:registro[i].modulos,
                    fecha:registro[i].fecha
                }
                var newCursos = new Cursos(cursos);
                newCursos.save();
                
            }
         
            //resolve(utf8.decode(cambio))
        }else{
            reject('');
        }
    })

    return promesa;

}

router.get('/admin/noticias',async(req,res)=>{
    const noticias=await Noticias.find();

    if(noticias){
        res.status(200).json(noticias)
    }else{
        res.status(400).json({resp:"No se encuentra publicación"});
    }
});

router.post("/admin/noticias/registrar",upload.single('noticiaportada'),async(req,res)=>{

    const noticia=req.body;

    if(req.file){
        const filename=req.file.filename;
        portada=`assets/storage/noticias/${filename}`
    }

    noticia.portada=portada;
    noticia.tags1=req.body.tags;
    let noticiasModel = new Noticias(noticia);
    await noticiasModel.save();
    res.json({'res':true});
})


router.put("/admin/noticias/editar",upload.single('noticiaportada'),async(req,res)=>{

    const {id,tipo,autor,titulo,categoria,tags,resumen,contenido,estado,fechaEdicion,rutaportada} = req.body;
   
    const fechaFormateada=moment(fechaEdicion).format('LL');
    const fechaSubida=fechaEdicion;
    console.log(fechaFormateada);
    if(req.file){
        const filename=req.file.filename;
        portada=`assets/storage/noticias/${filename}`;
    }else{
        portada=rutaportada;
    }

    const updatedNoticias= await Noticias.findByIdAndUpdate(id,{tipo,autor,titulo,categoria,tags,resumen,contenido,estado,fechaEdicion,fechaSubida,fechaFormateada,portada});

    
    res.json({"res":true,content:updatedNoticias});
})


router.delete('/admin/noticias/eliminar/:id',async(req,res)=>{

    const id=req.params.id;
    await Noticias.deleteOne({_id:id});
    res.json({"res":true});

})




module.exports = router