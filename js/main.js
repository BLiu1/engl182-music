(function() {
	'use strict';

	// requestAnimationFrame polyfill from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ and http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	(function(){var lastTime=0;var vendors=["webkit","moz","ms","o"];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[vendors[x]+"CancelAnimationFrame"]||window[vendors[x]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=(new Date).getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall)},timeToCall);lastTime=currTime+timeToCall;return id};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id)}})();
	var addEvent = function(obj, evt, fnc) {/*https://gist.github.com/eduardocereto/955642*/if(obj.addEventListener){obj.addEventListener(evt,fnc,false);return true;}else if(obj.attachEvent){return obj.attachEvent('on'+evt,fnc);}else{evt='on'+evt;if(typeof obj[evt]==='function'){fnc=(function(f1,f2){return function(){f1.apply(this,arguments);f2.apply(this,arguments);}})(obj[evt],fnc);}obj[evt]=fnc;return true;}return false;};

	var videos = [
		document.getElementById("drums"),
		document.getElementById("melodies"),
		document.getElementById("bass"),
		document.getElementById("chords1"),
		document.getElementById("chords2"),
		document.getElementById("fx")
	];

	var videoWrappers = document.getElementsByClassName('vid-wrapper');
	for (var i = 0; i < videoWrappers.length; i++) {
		addEvent(videoWrappers[i], "click", function () {
			// only way I could get the video object
			var vid = this.children[0];
			// toggles whether it's muted
			vid.muted = !vid.muted;

			// get the cover div
			var cover = this.children[1];
			// toggles whether it's on top of the video
			cover.style.zIndex = (cover.style.zIndex == 2) ? 0 : 2;
		});
	}

	setTimeout(function () {
		checkLoad(videos);
	}, 1000);

	setInterval(function () {
		syncVideos(videos[0], videos.slice(1, videos.length));
	}, 100);

	addEvent(videos[0], "timeupdate", checkLoop);

	// takes array of video objects
	function checkLoad(videos) {
		for (var i = 0; i < videos.length; i++) {
			if (videos[i].readyState !== 4) {
				setTimeout(function () {
					checkLoad(videos);
				}, 100);
				return;
			}
		}
		startVideos(videos);
	}

	// takes array of video objects
	function startVideos(videos) {
		for (var i = 0; i < videos.length; i++) {
			videos[i].play();
		}
	}

	// takes a video object and an array of video objects
	// syncs the rest of the videos to the first by adjusting playback speeds
	function syncVideos(_masterPlayer, _slavePlayers) {
		var adjustmentSensitivity = 5;
		var slowestPlaybackSpeed = 0.02;
		var fastestPlaybackSpeed = 50.00;
		// Code adapted from this comment http://disq.us/p/th4uhk
		//   on https://bocoup.com/blog/html5-video-synchronizing-playback-of-two-videos/
		// Compensate for discrepency in playback sync by changing the frame rate of the player(s)
		// _masterPlayer is the track whose playback rate will be steady
		// _slavePlayers are all the tracks who will be forced to stay in sync with _masterPlayer
		for (var i = 0; i < _slavePlayers.length; i++) {
			var timeDiff = (_masterPlayer.currentTime - _slavePlayers[i].currentTime);
			var compensatingFrameRate = (
					Math.min(
						Math.max(
							(timeDiff * adjustmentSensitivity + 1)
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

	// didn't work - stutters
	/*function syncVideos(firstVideo, otherVideos) {
		var firstTimeStamp, secondTimeStamp;
		for (var i = 0; i < otherVideos.length; i++) {
			firstTimeStamp = firstVideo.currentTime;
			secondTimeStamp = otherVideos[i].currentTime;
			if (Math.abs(secondTimeStamp - firstTimeStamp) > 0.1){
				videos[i].currentTime = firstTimeStamp;
			}
		}
	}*/

	// manually makes all the videos loop in sync
	// called by eventListener
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
