(function() {
	'use strict';

	// requestAnimationFrame polyfill from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ and http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	(function(){var lastTime=0;var vendors=["webkit","moz","ms","o"];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[vendors[x]+"CancelAnimationFrame"]||window[vendors[x]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=(new Date).getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall)},timeToCall);lastTime=currTime+timeToCall;return id};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id)}})();
	var addEvent = function(obj, evt, fnc) {/*https://gist.github.com/eduardocereto/955642*/if(obj.addEventListener){obj.addEventListener(evt,fnc,false);return true;}else if(obj.attachEvent){return obj.attachEvent('on'+evt,fnc);}else{evt='on'+evt;if(typeof obj[evt]==='function'){fnc=(function(f1,f2){return function(){f1.apply(this,arguments);f2.apply(this,arguments);}})(obj[evt],fnc);}obj[evt]=fnc;return true;}return false;};

	var videos = getArrayOfVideos();
	var videoWrappers = document.getElementsByClassName('vid-wrapper');
	window.firstToggle = false; // GLOBAL VAR

	// make sure the videos stay in sync by adjusting every 100 ms
	setInterval(function () {
		// sync second - last video with first video
		syncVideos(videos[0], videos.slice(1, videos.length));
	}, 100);

	// manually loops the videos once they have played through
	addEvent(videos[0], "timeupdate", checkLoop);

	// stops playing when going to YouTube
	addEvent(document.getElementById('link'), "click", function (e) {
		togglePlayPause(e, true);
	});

	/******************************************/
	/* Click Listeners */

	// gives mute/unmute behavior to videoWrappers
	for (var i = 0; i < videoWrappers.length; i++) {
		addEvent(videoWrappers[i], "click", toggleSingle);
	}

	// stop focusing once clicked
	var buttons = document.getElementsByClassName('control');
	for (var i = 0; i < buttons.length; i++) {
		addEvent(buttons[i], "click", function () {
			this.blur();
		})
	}

	/* Controls */
	addEvent(document.getElementById('togglePlayPause'), "click", togglePlayPause);
	addEvent(document.getElementById('restartAll'), "click", restartAll);
	addEvent(document.getElementById('muteAll'), "click", muteAll);
	addEvent(document.getElementById('toggleAll'), "click", toggleAll);

	/******************************************/
	/* Keyboard Input Listener */
	var keyListener = new window.keypress.Listener();
	keyListener.simple_combo("space", togglePlayPause);
	keyListener.simple_combo("p", togglePlayPause);
	keyListener.simple_combo("enter", restartAll);
	keyListener.simple_combo("r", restartAll);
	keyListener.simple_combo("m", muteAll);
	keyListener.simple_combo("s", toggleAll);
	keyListener.simple_combo("t", toggleAll);
	keyListener.simple_combo("i", toggleAll);

	/******************************************/

	muteAll();


	/******************************************/

	// returns an array of video DOM objects
	function getArrayOfVideos() {
		var videoElements = document.getElementsByClassName('music');
		return HTMLCollectionToArray(videoElements);
	}

	// converts an HTMLCollection to an array
	function HTMLCollectionToArray(collection) {
		try {
			return Array.prototype.slice.call(collection);
		} catch (e) {
			for(var i = 0, a = []; i < collection.length; i++){
	        	a.push(collection[i]);
			}
			return a;
		}
	}

	// toggles a single video between muted and unmuted
	// called by click eventListener from individual videoWrapper
	// if an element is passed in, it will use that as the videoWrapper
	function toggleSingle(e, el) {
		var self = el || this;
		// get the video object
		var vid = self.children[0];
		// toggles whether it's muted
		vid.muted = !vid.muted;

		// get the cover div
		var cover = self.children[1];
		// toggles whether it's "focused"
		cover.classList.toggle("cover-on");
		cover.classList.toggle("cover-off");

		// handle tooltip first case
		if (!window.firstToggle) {
			document.getElementsByClassName("content")[0].classList.remove("firstToggle");
			var child = document.getElementById("tip");
			child.parentNode.removeChild(child);
			// play all
			var videoElements = document.getElementsByClassName('music');
			for (var i = 0; i < videoElements.length; i++) {
				videoElements[i].play();
			}
			checkPaused();
		}
		window.firstToggle = true;
	}

	// toggles all videos to their opposites (muted to unmuted and vice versa)
	// called by click eventListener from control button
	function toggleAll() {
		var videoWrappers = document.getElementsByClassName('vid-wrapper');
		for (var i = 0; i < videoWrappers.length; i++) {
			toggleSingle(undefined, videoWrappers[i]);
		}
	}

	// mutes all videos
	// called by click eventListener from control button
	function muteAll() {
		var videoWrappers = document.getElementsByClassName('vid-wrapper');
		for (var i = 0; i < videoWrappers.length; i++) {
			// mute video object
			videoWrappers[i].children[0].muted = true;
			// put cover div on top
			var cover = videoWrappers[i].children[1];
			cover.classList.add("cover-on");
			cover.classList.remove("cover-off");
		}
	}

	// toggles the play state of all videos
	// called by click eventListener from control button
	function togglePlayPause(e, pause) {
		var videoElements = document.getElementsByClassName('music');
		var isPaused = videoElements[0].paused;
		var pause = pause || false;

		if (isPaused && !pause) {
			// play all videos
			for (var i = 0; i < videoElements.length; i++) {
				videoElements[i].play();
			}
		} else {
			// paused all videos
			for (var i = 0; i < videoElements.length; i++) {
				videoElements[i].pause();
			}
		}

		checkPaused();
	}

	// puts all videos at the start
	// called by click eventListener from control button
	function restartAll() {
		var videoElements = document.getElementsByClassName('music');
		for (var i = 0; i < videoElements.length; i++) {
			videoElements[i].currentTime = 0;
		}
		checkPaused();
	}

	// checks if play pause icon should be switched and does so
	// returns if it is paused
	function checkPaused() {
		var isPaused = document.getElementsByClassName('music')[0].paused;
		var togglePlayPauseButton = document.getElementById('togglePlayPause').children[0];
		// change icon and alt
		if (isPaused) {
			togglePlayPauseButton.src = "img/play.svg";
			togglePlayPauseButton.alt = "Play";
		} else {
			togglePlayPauseButton.src = "img/pause.svg";
			togglePlayPauseButton.alt = "Pause";
		}
	}








	// checks whether all videos have loaded and starts all of them
	function checkLoad() {
		var videos = document.getElementsByClassName('music');
		for (var i = 0; i < videos.length; i++) {
			if (videos[i].readyState !== 4) {
				setTimeout(checkLoad, 100);
				return;
			}
		}
		startVideos(videos);
	}

	// takes array of video objects
	// starts all videos playing
	function startVideos(videos) {
		for (var i = 0; i < videos.length; i++) {
			videos[i].play();
		}
		checkPaused();
	}

	// takes a video object and an array of video objects
	// syncs the rest of the videos to the first by adjusting playback speeds
	function syncVideos(_masterPlayer, _slavePlayers) {
		var maxTimeDiff = 0.5; // seconds
		var adjustmentSensitivity = 2;
		var slowestPlaybackSpeed = 0;
		var fastestPlaybackSpeed = 10.00;
		// Code adapted from this comment http://disq.us/p/th4uhk
		//   on https://bocoup.com/blog/html5-video-synchronizing-playback-of-two-videos/
		// Compensate for discrepency in playback sync by changing the frame rate of the player(s)
		// _masterPlayer is the track whose playback rate will be steady
		// _slavePlayers are all the tracks who will be forced to stay in sync with _masterPlayer
		for (var i = 0; i < _slavePlayers.length; i++) {
			var timeDiff = (_masterPlayer.currentTime - _slavePlayers[i].currentTime);
			// if somehow they get massively separated
			if (Math.abs(timeDiff) > maxTimeDiff){
				_slavePlayers[i].currentTime = _masterPlayer.currentTime;
			}
			var compensatingFrameRate = (
					Math.min(
						Math.max(
							(timeDiff * adjustmentSensitivity + _masterPlayer.playbackRate)
							, slowestPlaybackSpeed
						)
						, fastestPlaybackSpeed
					)
				).toFixed(2);

			if (compensatingFrameRate > .99 && compensatingFrameRate < 1.01) {
				compensatingFrameRate = 1.00;
			}

			_slavePlayers[i].playbackRate = compensatingFrameRate;
		}
	}

	// manually makes all the videos loop in sync
	// called by timeupdate eventListener on first video
	function checkLoop() {
		// once the first one has reached almost the end,
		// all of them are reset to the beginning
		if(this.currentTime >= this.duration - 0.1) {
			for (var i = 0; i < videos.length; i++) {
				videos[i].currentTime = 0;
				videos[i].play();
			}
		}
	}
}());
