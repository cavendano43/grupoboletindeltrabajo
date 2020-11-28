var pdf = require('html-pdf');

exports.generarPDF = async function(contenido,name){
    
    pdf.create(contenido).toFile(name, function(err, res) {
        if (err){
            return err;
        } else {
            return res;
        }
    });
 
}