var express    = require('express');
var bodyParser = require("body-parser");
var db         = require("./db.js")


var app = express();

app.use("/",express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(bodyParser.text());







app.get('/api/disk/fetch_list', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	let args = req.query
	
	setTimeout(function(){
		var r1 = db.findChild(args.parent_id)
		if (r1.err){
			return res.json({success:false,info:r1.err})
		}
		var r2 = db.findPath(args.parent_id);
		if (r2.err){
			return res.json({success:false,info:r2.err})
		}
		return res.json({success : true,list : r1.data,path:r2.data});
	},500)
});

app.get("/api/disk/fetch_tree",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	let args = req.query
	
	setTimeout(function(){
		let result = db.findTree(args.parent_id)
		if ( result.err ){
			return res.json({success : false, info:result.err});
		}
		
		return res.json({success : true, tree:result.data });
	},500)
	
});



app.post("/api/disk/mkdir",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	var args = JSON.parse(req.body)
	
	setTimeout(function(){
		var result = db.mkdir(args.parent_id,args.name);
		if (result.err){
			return res.json({success:false,info:result.err})
		}
		return res.json({success:true,info:""});
	},500);
});

app.post("/api/disk/rename",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	var args = JSON.parse(req.body)
	
	
	setTimeout(function(){
		var result = db.rename(args.parent_id,args.source,args.target);
		if (result.err){
			return res.json({success:false,info:result.err})
		}
		return res.json({success:true,info:""});
	},500);
	return;
});

app.post("/api/disk/remove",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	var args = JSON.parse(req.body)
	
	setTimeout(function(){
		var result = db.remove(args.id);
		if (result.err){
			return res.json({success:false,info:result.err})
		}
		return res.json({success:true,info:""});
	},500);
	return;
});

app.post("/api/disk/move",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	var args = JSON.parse(req.body)
	
	setTimeout(function(){
		var result = db.move(args.source_id,args.target_id);
		if (result.err){
			return res.json({success:false,info:result.err})
		}
		return res.json({success:true,info:""});
	},500);
	return;

});

app.post("/api/disk/copy",function(req,res){
	res.header('Access-Control-Allow-Origin', '*');
	var args = JSON.parse(req.body)
	
	setTimeout(function(){
		var result = db.copy(args.source_id,args.target_id);
		if (result.err){
			return res.json({success:false,info:result.err})
		}
		return res.json({success:true,info:""});
	},500);
	return;

});




app.listen(3000);
