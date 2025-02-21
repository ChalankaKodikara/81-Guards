
const multer = require('multer');

const storage = multer.diskStorage({
    
    destination: function(req,file,cb){
      
        cb(null,'./upload/tender bidders');
        
    },
    filename: function(req,file,cb){
        
        if(file){
            cb(null,`${file.fieldname}-${Date.now()}-${file.originalname}`);
        }
        }
        
});

const upload = multer({storage:storage});

module.exports = upload;