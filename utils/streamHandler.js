var Tweet = require('../models/tweet');

module.exports = function (stream, io) {

	// When tweets get sent our way...
	stream.on('data', function(data) {

		var tweet = {
			twid: data['id'],
			twid: data['id'],
      active: false,
      author: data['user']['name'],
      avatar: data['user']['profile_image_url'],
      body: data['text'],
      date: data['created_at'],
      screenname: data['user']['screen_name']
		};

		// Create a new model instance with our tweet object
		var tweetEntry = new Tweet(tweet);

		// Save to the database
		tweetEntry.save(function (err) {
			
			if (!err) {
				io.emit('tweet', tweet);
			}

		});

	});

};