/** @jsx React.DOM */

var React = require('react');
var Tweets = require('./Tweets.react.js');
var Loader = require('./Loader.react.js');
var NotificationBar = require('./NotificationBar.react.js');


module.exports = TweetsApp = React.createClass({

	// method to add a tweet to our timeline
	addTweet: function(tweet) {
		var updated = this.state.tweets;
		var count = this.state.count + 1;
		var skip = this.state.skip + 1;

		updated.unshift(tweet);
		this.setState({tweets: updated, count: count, skip: skip});
	},


	// method to get JSON from server by page
	getPage: function(page) {

		// setup ajax request
		var request = new XMLHttpRequest(), self = this;
		request.open('GET', 'page/' + page + '/' + this.state.skip, true);
		
		request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				self.loadPagedTweets(JSON.parse(request.responseText));
			}
			else {
				self.setState({paging: false, done: true});
			}
		};

		request.send();

	},


	// method to show unread tweets
	showNewTweets: function() {
		var updated = this.state.tweets;

		updated.forEach(function(tweet) {
			tweet.active = true;
		});

		// set application stat (active tweets + reset unread count)
		this.setState({tweets: updated, count: 0});
	},


	// method to load tweets fetched from the server
	loadPagedTweets: function(tweets) {
		var self = this;

		// if we still have tweets...
		if(tweets.length > 0) {
			
			// get current applcation state
			var updated = this.state.tweets;

			tweets.forEach(function (tweet) {
				updated.push(tweet);
			});

			setTimeout(function() {
				self.setState({tweets: updated, paging: false});
			}, 500);

		} else {
			this.setState({done: true, paging: false});
		}
	},


	// method to check if more tweets should be loaded, by scroll postion
	checkWindowScroll: function() {

		// get scroll pos & window data
		var h = Math.max(document.documentElement.cliendHeight, window.innterHeight || 0);
		var s = document.body.scrollTop;
		var scroll = (h + s) > document.body.offsetHeight;

		if(scrolled && !this.state.paging && !this.state.done) {
			this.setState({paging: true, page: this.state.page + 1});

			this.getPage(this.state.page);
		}

	},
	

	getInitialState: function(props) {

		props = props || this.props;

		return {
			tweets: props.tweets,
			count: 0,
			page: 0,
			paging: false,
			skip: 0,
			done: false
		};

	},

	componentWillReceiveProps: function (newProps, oldProps) {
		this.setState(this.getInitialState(newProps))
	},

	componentDidMount: function () {

		var self = this;

		// initialze socket.io
		var socket = io.connect();

		// on tweet event emission...
		socket.on('tweet', function (data) {
			// add tweet to our queue
			self.addTweet(data);
		});

		// attach scroll even to the window fro infinity paging
		window.addEventListener('scoll', this.checkWindowScroll);

	},


	// Render the component
	render: function() {

		return (
			<div	className="tweets-app">
				<Tweets tweets={this.state.tweets} />
				<Loader paging={this.state.paging} />
				<NotificationBar count={this.state.count} onShowNewTweets={this.showNewTweets} />
			</div>
		)

	}

});