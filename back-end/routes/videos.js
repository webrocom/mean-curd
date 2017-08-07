var express = require('express');
var fs = require("fs");
var router = express.Router();
var ucfirst = require('ucfirst');
var path = require("path");
var monk = require('monk');
var multer  = require('multer');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');
/* Multer set storage location*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/posters/')
  },
  filename: function (req, file, cb) {
  	  global.poster = Date.now() + '_' + file.originalname;
  	  cb(null, poster);

  }
});

var upload = multer({ storage: storage });
//var upload = multer({ dest: 'public/posters/' });
var db = monk('localhost:27017/vidzy');




/* Fetch or get All videos */
router.get('/', function(req, res){
	var collection = db.get('videos');
	collection.find({}, { sort: { _id : -1}}, function(err, videos){
		if(err)
			throw err;
		res.json(videos);
	});
});


/* Create a single video with poster upload */
router.post('/', upload.single('poster'), function(req, res){
	var collection = db.get('videos');
	poster = (typeof poster === 'undefined') ? '' : poster;
	collection.insert({
		title: req.body.title,
		genre: JSON.parse(req.body.genre),
		description: req.body.description,
		poster : poster
	}, function(err, video){
			if(err)
				throw err;
			res.json(video);
	});
});


/* Create a category */
router.post('/category', function(req, res){
	var collection = db.get('categories');
	collection.insert({
		name: ucfirst(req.body.category)
	}, function(err, category){
			if(err)
				throw err;
			res.json(category);
	});
});

/* Get All categoories */
router.get('/categories', function(req, res){
	var collection = db.get('categories');
	collection.find({}, { sort: { name : 1}}, function(err, categories){
			if(err)
				throw err;
			res.json(categories);
	});
});


/* Get all videos list */

router.get('/', function(req, res){
	var collection = db.get('videos');
	collection.find({}, { sort: { _id : -1}}, function(err, videos){
		if(err)
			throw err;
		res.json(videos);
	});
});


/* Perform batch delete operation */

router.post('/batchDelete', function(req, res){
	var collection = db.get('videos');
	var batch = [];
	req.body.batch.forEach(function(value){
		doc_id = new ObjectId(value);
  		batch.push(doc_id);
	});
	collection.remove( { _id : { $in : batch } }, function(err, video){
		if(err)
			throw err;
		res.json(video);
	});

});

	

/* Get single video */

router.get('/:id', function(req, res){
	var collection = db.get('videos');
	collection.find({ _id: req.params.id }, function(err, video){
		if(err)
			throw err;
		res.json(video);
	});
});


/*Update a video*/

router.put('/:id', upload.single('poster'), function(req, res){
	var collection = db.get('videos');
	if(typeof poster !== 'undefined'){
		var cur_video = {
			title: req.body.title,
			description: req.body.description,
			genre: JSON.parse(req.body.genre),
			poster: poster
		};
	}else{
		var cur_video = {
			title: req.body.title,
			description: req.body.description,
			genre: req.body.genre
		};
	}
	collection.update({
		_id : req.params.id
	},
	cur_video
	, function(err, video){
		if(err)
			throw err;
	});
	collection.find({ _id: req.params.id }, function(err, video){
		if(err)
			throw err;
		res.json(video);
	});
});

/* Delete a video */

router.delete('/:id', function(req, res){
		var collection = db.get('videos');
		collection.find({_id : req.params.id }, function(err, video){
			if(err) throw err;			
			global.poster_image =  video[0]['poster'];
			collection.remove({ _id : req.params.id}, function(err, video){		
				if(err)
					throw err;
				/* unlink poster */
				fs.unlink('public/posters/'+poster_image+'', (err) => {
					if (err) throw err;
					console.log('successfully deleted /tmp/hello');
				});
				res.json(video);
			});

		});
});



module.exports = router;