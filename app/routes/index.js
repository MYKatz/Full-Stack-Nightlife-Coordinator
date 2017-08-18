'use strict';

var path = process.cwd();
var request = require('request');
var Bar = require('../models/bars');
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {
	
	function makeBar (body, i, toR, fn){
		Bar.findOne({"id" : body["businesses"][i]["id"]}, function(err, bar){
						if(err){throw err}
						if(bar){fn(bar)}
						else{
							var newBar = new Bar();
							newBar.name = body["businesses"][i]["name"];
							newBar.id = body["businesses"][i]["id"];
							newBar.image = body["businesses"][i]["image_url"];
							newBar.going = [];
							
							newBar.save(function(err){
								if(err){throw err}
								else{
									
								}
							});
							
							fn(newBar);
						}
					});
	}

	function isLoggedIn (req, res, next) {
		return next();
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
	app.route('/api/bars/:city')
		.get(function(req, res){
			
			var options = {
				url: "https://api.yelp.com/v3/businesses/search?location="+req.params.city+"&categories=bars",
				method: 'GET',
				headers: {
					'Authorization' : "Bearer usJX8W2YeFadFCw7IrgAu78_uua7TL-Vnr6tW0qD9p6zsG0rDjFXstDjXR47CZ2rdydBDYQlva9X7IHrLZ4XPj-59j-VlvwmM59-bgCwT4fR1Nnx34G2R5pxU0ORWXYx"
				}
			}
			
			request(options, function(err, response, bod){
				var body = JSON.parse(bod);
				//bbby["businesses"];
				if(err){console.log("ERROR");}
				var toR = [];

				for(var i=0;i<body["businesses"].length;i++){
					makeBar(body, i, toR, function(b){
							toR.push(b);
							if(toR.length == body["businesses"].length){
								res.json(toR);
							}
					});
					
				}

			});
				
		});
		
	app.route('/api/going/:id')
		.get(function(req, res){
			console.log(req.params.id);
			if(!req.isAuthenticated()){
				res.send('redirect');
			}
			else{
				Bar.findOne({"id" : req.params.id}, function(err, bar){
					console.log(req.params.id);
					if(err){throw err}
					if(bar){
						if(bar.going.indexOf(req.user.twitter.id) > -1){
							bar.going = bar.going.splice(bar.going.indexOf(req.user.twitter.id), 1);
							console.log(bar.going.indexOf(req.user.twitter.id));
							console.log(bar.going.splice(bar.going.indexOf(req.user.twitter.id), 1));
							bar.save();
							res.end(""+bar.going.length);
						}
						else{
							bar.going.push(req.user.twitter.id);
							bar.save();
							res.end(""+bar.going.length);
						}
					}
					else{
						res.end("suqq");
					}
				});
			}
		});
	
	app.route('/api/isAuth')
		.get(function(req, res){
			if(req.isAuthenticated()){res.end(true)}
			else{res.end(false)}
		});
};
