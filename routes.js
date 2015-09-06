var JSX = require('node-jsx').install(),
	React = require('react'),
	TweetsApp = React.createFactory(require('./components/TweetsApp.react')),
	Tweet = require('./models/tweet');


module.exports = {

	index: function(req, res) {

		// Call static model metod to get tweets from the db
		Tweet.getTweets(0,0, function(tweets, pages) {

			// Render React to a string, passing in our fetched tweets
			var markup = React.renderToString(
				TweetsApp({
					tweets: tweets
				})
			);

			// Render our 'home' template
			res.render('home', {
				markup: markup, // pass rendered react markup
				state: JSON.stringify(tweets) // pass current state to client side
			});

		});

	},

	
	page: function (req, res) {

		// Fetch tweets by page via param
		Tweet.getTweets(req.params.page, req.params.skip, function (tweets) {

			// render as JSON
			res.send(tweets);
			
		});
	} 

}