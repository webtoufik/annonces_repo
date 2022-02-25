const express = require('express');
const app = express();

const mysql = require('promise-mysql');

//on va pouvoir stocker nos images que l'on télécharge du front dans un dossier static qui se situe dans le dossier public
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    createParentPath: true
}));

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//nous évite que le navigateur bloque nos requêtes ajax
const cors = require('cors');
app.use(cors());

app.use(express.static(__dirname + '/public'));

mysql.createConnection({
	host: "db.3wa.io",
	database: "toufikbezzaouya_annonces",
	user: "toufikbezzaouya",
	password: "230c5397572a94cc027dc80d68923232"
	//port: 8889
}).then((db) => {
	console.log('connecté bdd');
	setInterval(async function () {
		let res = await db.query('SELECT 1');
	}, 10000);
	
	app.get("/", (req,res,next)=>{
	    res.json({status: 200, msg: "Welcome to your annonces API bro!"})
	})
	
	app.get('/api/v1/ads', async (req, res, next)=>{
	    
	    let adsBDD = await db.query('SELECT * FROM ads');
	    
	    if(adsBDD.code){
	        res.json({status:500, error_msg: adsBDD})
	    }
	    
	    res.json({status: 200, results:{msg: "Success", ads: adsBDD}})
	})
	
	//route de récupération d'un article par son id
	
	
	app.post('/api/v1/ads/save', (req, res, next)=>{
	    db.query('INSERT INTO ads (Title, Contents, CreationTimestamp, Url) VALUES (?, ?, NOW(), ?)', [req.body.title, req.body.contents, req.body.url ])
		.then((result, err)=>{
		    if(err){
		        res.json({status: 500, msg: "pb ajout", error: err})
		    }
		    res.json({status: 200, result: "success"})
		    
		})
		.catch(err=>console.log("Error ajout:", err))
	})
	
		//route pour enregistrer une image vers notre dossier static
	app.post('/api/v1/ads/pict', (req, res, next)=>{
		console.log(req.files.image);
		//si on a pas envoyé de req.files via le front ou que cet objet ne possède aucune propriété
		if (!req.files || Object.keys(req.files).length === 0) {
			//on envoi une réponse d'erreur
	    	 res.json({status: 400, msg: "La photo n'a pas pu être récupérée"});
	    }
	    
	    //la fonction mv va envoyer l'image dans le dossier que l'on souhaite.
	    req.files.image.mv('public/images/'+req.files.image.name, function(err) {
	    	console.log('ça passe', '/public/images/'+req.files.image.name)
	    	//si ça plante dans la callback
		    if (err) {
		    //renvoi d'un message d'erreur
		      res.json({status: 500, msg: "La photo n'a pas pu être enregistrée"})
		    }
	    	
	    })
		//on doit renvoyer le nom de l'image dans la reponse vers le front car il en aura besoin pour pouvoir enregistrer le nom de l'image dans la bdd lors de la sauvegarde de l'annonce
		res.json({status: 200, msg: 'ok', url: req.files.image.name});
	})
	
	
})
.catch(err=>console.log("Erreur Connection: ", err))

const PORT = process.env.PORT || 9500;
app.listen(PORT, ()=>{
	console.log('listening port '+PORT+' all is ok');
})