
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.portaldesoluciones.cl",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'contacto@portaldesoluciones.cl', // generated ethereal user
    pass: '@8dQIaBC[cIm', // generated ethereal password
  },tls:{
      rejectUnauthorized: false
    }
});

exports.enviarCorreo = async function(nombre,email,telefono,asunto,mensaje){
  
  const opciones = {
    from:'contacto@portaldesoluciones.cl',
    to:email,
    subject: asunto,
    text:`
    Nombre: ${nombre}
    Email: ${email}
    Asunto: ${asunto} 
    Telefono: ${telefono}
    mensaje:
     ${mensaje}
    `
  }

  await transporter.sendMail(opciones,(error,info)=>{

      if(info){
         
          return true;
          
        }else{
          console.log(error)
          return false;
          
      }
  })

}

