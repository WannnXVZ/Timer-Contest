const sfx = {
	checkpoint: document.getElementById("checkpointSound"),
	raceEndAudio: document.getElementById("raceEndAudio"),
	timesUpAudio: document.getElementById("timesUpAudio"),
	prepare: document.getElementById("prepare"),
	start: document.getElementById("start"),
	mainThemeAudio: document.getElementById('mainThemeAudio'),
	applauseAudio: document.getElementById('applauseAudio'),
};

// Safe audio helpers (berjalan mulus meskipun file audio belum dimasukkan)
const playAudio = (audio) => {
	if (!audio) return;
	try {
		const res = audio.play();
		if (res && typeof res.catch === 'function') {
			res.catch(() => {});
		}
	} catch (e) {}
};

const pauseAudio = (audio) => {
	if (!audio) return;
	try {
		audio.pause();
	} catch (e) {}
};

const resetAudioTime = (audio) => {
	if (!audio) return;
	try {
		audio.currentTime = 0;
	} catch (e) {}
};

// fungsi untuk muted suara audio
const toggleBgm = (isMuted) => {
	if (sfx.mainThemeAudio) sfx.mainThemeAudio.muted = isMuted;
};

const toggleSfx = (isMuted) => {
	['checkpoint', 'raceEndAudio', 'timesUpAudio', 'start', 'applauseAudio', 'prepare'].forEach(key => {
		if (sfx[key]) sfx[key].muted = isMuted;
	});
};

// global dynamic var list
let isIdle,
	isTimerStart,
	isRaceBegin,
	isPrepBegin,
	isAFinished,
	isBFinished,
	remainTime,
	elapsedTime,
	teamTimes,
	limitTime;

const initVarState = () => {
	isIdle = false;
	isTimerStart = false;
	isRaceBegin = false;
	isPrepBegin = false;
	isAFinished = false;
	isBFinished = false;
	remainTime = undefined;
	elapsedTime = 0;
	teamTimes = {
		a: [],
		b: []
	};
};

const setting = getSetting();

// waktu hitung mundur (milisecond)
const prepDuration = setting.prep_time * 1000;

// waktu hitung maju (milisecond)
const raceDuration = setting.race_duration * 1000;

let theInterval;

initVarState();
toggleSfx(!setting.isSfxEnabled);
toggleBgm(!setting.isBgmEnabled);
try {
	if (sfx.applauseAudio) sfx.applauseAudio.volume = 0.5;
	if (sfx.mainThemeAudio) sfx.mainThemeAudio.loop = true;
} catch (e) {}

const updateAudioButtons = () => {
	const sfxBtn = document.getElementById('sfxToggleBtn');
	const bgmBtn = document.getElementById('bgmToggleBtn');

	if (sfxBtn) {
		sfxBtn.className = setting.isSfxEnabled ? 'btn-ctrl btn-active' : 'btn-ctrl btn-muted';
		sfxBtn.innerHTML = `<i class="fa ${setting.isSfxEnabled ? 'fa-volume-up' : 'fa-volume-off'}"></i> SFX: ${setting.isSfxEnabled ? 'ON' : 'OFF'} <kbd>O</kbd>`;
	}

	if (bgmBtn) {
		bgmBtn.className = setting.isBgmEnabled ? 'btn-ctrl btn-active' : 'btn-ctrl btn-muted';
		bgmBtn.innerHTML = `<i class="fa ${setting.isBgmEnabled ? 'fa-music' : 'fa-minus-circle'}"></i> BGM: ${setting.isBgmEnabled ? 'ON' : 'OFF'} <kbd>P</kbd>`;
	}
};

const syncTimerUI = () => {
	const btn = document.getElementById('btnPlayPause');
	const text = document.getElementById('playPauseText');
	const mode = document.getElementById('mode');

	if (btn && text) {
		const icon = btn.querySelector('i');
		if (isTimerStart) {
			btn.classList.add('is-running');
			if (icon) icon.className = 'fa fa-pause';
			text.innerText = 'Pause';
		} else {
			btn.classList.remove('is-running');
			if (icon) icon.className = 'fa fa-play';
			text.innerText = (isPrepBegin || isRaceBegin) ? 'Resume' : 'Start';
		}
	}

	if (mode) {
		mode.classList.remove('mode-prep', 'mode-race', 'mode-finish', 'mode-paused');
		if (isAFinished && isBFinished) {
			mode.innerHTML = 'RACE FINISHED';
			mode.classList.add('mode-finish');
		} else if (elapsedTime >= raceDuration && isRaceBegin) {
			mode.innerHTML = "TIME'S UP";
			mode.classList.add('mode-finish');
		} else if (isRaceBegin) {
			mode.innerHTML = isTimerStart ? 'RACE TIME' : 'RACE PAUSED';
			mode.classList.add(isTimerStart ? 'mode-race' : 'mode-paused');
		} else if (isPrepBegin) {
			mode.innerHTML = isTimerStart ? 'PREPARATION TIME' : 'PREP PAUSED';
			mode.classList.add(isTimerStart ? 'mode-prep' : 'mode-paused');
		} else {
			mode.innerHTML = 'PREPARATION TIME';
			mode.classList.add('mode-prep');
		}
	}
};

// Quick action trigger helpers for buttons
function triggerPlayPause() {
	checkPressedKey({ keyCode: 32 });
}

function triggerReset() {
	checkPressedKey({ keyCode: 82 });
}

function triggerLapA() {
	checkPressedKey({ keyCode: 65 });
}

function triggerLapB() {
	checkPressedKey({ keyCode: 66 });
}

function triggerToggleSfx() {
	checkPressedKey({ keyCode: 79 });
}

function triggerToggleBgm() {
	checkPressedKey({ keyCode: 80 });
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen().catch(() => {});
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}

function checkPressedKey(e) {
	switch (e.keyCode) {
		case 65: // A => Lap TIM A
			if (!isAFinished && isRaceBegin) {
				checkpointTeam('a');
			}
			break;

		case 66: // B => Lap TIM B
			if (!isBFinished && isRaceBegin) {
				checkpointTeam('b');
			}
			break;

		case 32: // Spasi => Start / Pause
			if (!isTimerStart) {
				isTimerStart = true;

				if (isRaceBegin) {
					playAudio(sfx.mainThemeAudio);
					const beginTime = new Date().getTime() - elapsedTime;
					theInterval = setInterval(() => raceInterval(beginTime), 10);
				} else if (isPrepBegin) {
					playAudio(sfx.mainThemeAudio);
					limitTime = new Date().getTime() + remainTime;
					theInterval = setInterval(() => prepInterval(limitTime), 10);
				} else {
					startPrepTime();
				}
			} else {
				if (!isIdle) {
					isTimerStart = false;
					clearInterval(theInterval);
					pauseAudio(sfx.mainThemeAudio);
				}
			}
			syncTimerUI();
			break;

		case 79: // O => toggle SFX
			setting.isSfxEnabled = !setting.isSfxEnabled;
			toggleSfx(!setting.isSfxEnabled);
			localStorage.setItem('krc_timer_setting', JSON.stringify(setting));
			updateAudioButtons();
			break;

		case 80: // P => toggle BGM
			setting.isBgmEnabled = !setting.isBgmEnabled;
			toggleBgm(!setting.isBgmEnabled);
			localStorage.setItem('krc_timer_setting', JSON.stringify(setting));
			updateAudioButtons();
			break;

		case 82: // R => Reset
			if (!isIdle && !isTimerStart) {
				pauseAudio(sfx.mainThemeAudio);
				resetAudioTime(sfx.mainThemeAudio);
				clearInterval(theInterval);
				initVarState();
				toDisplayHtml(msToArrTime(prepDuration));
				printAllLaps();
				syncTimerUI();
			}
			break;
	}
}

const printAllLaps = () => {
	const aTimeLap = document.getElementById('aTimeLap');
	const midLapNo = document.getElementById('midLapNo');
	const bTimeLap = document.getElementById('bTimeLap');

	if (!aTimeLap || !midLapNo || !bTimeLap) return;

	aTimeLap.innerHTML = '';
	midLapNo.innerHTML = '';
	bTimeLap.innerHTML = '';

	for (let i = 0; i < setting.nLap; i++) {
		if (!teamTimes.a[i] && !teamTimes.b[i]) {
			midLapNo.innerHTML += "<p>LAP " + (i + 1) + "</p>";
		} else if (teamTimes.a[i] && !teamTimes.b[i]) {
			midLapNo.innerHTML += "<p>&laquo; LAP " + (i + 1) + "</p>";
		} else if (!teamTimes.a[i] && teamTimes.b[i]) {
			midLapNo.innerHTML += '<p>LAP ' + (i + 1) + ' &raquo;</p>';
		} else {
			if (teamTimes.a[i] < teamTimes.b[i]) {
				midLapNo.innerHTML += "<p>&laquo; LAP " + (i + 1) + "</p>";
			} else {
				midLapNo.innerHTML += '<p>LAP ' + (i + 1) + ' &raquo;</p>';
			}
		}

		if (teamTimes.a[i]) {
			const aTime = msToArrTime(teamTimes.a[i]);
			aTimeLap.innerHTML += '<p>' + aTime[0] + ':' + aTime[1] + ' <small>.' + aTime[2] + '</small></p>';
		} else {
			aTimeLap.innerHTML += '<p>--:--</p>';
		}

		if (teamTimes.b[i]) {
			const bTime = msToArrTime(teamTimes.b[i]);
			bTimeLap.innerHTML += '<p>' + bTime[0] + ':' + bTime[1] + ' <small>.' + bTime[2] + '</small></p>';
		} else {
			bTimeLap.innerHTML += '<p>--:--</p>';
		}
	}
};

const prepInterval = (limit) => {
	const now = new Date().getTime();
	remainTime = limit - now;

	toDisplayHtml(msToArrTime(remainTime));

	if (remainTime <= 0) {
		toDisplayHtml(["00", "00", "00"]);
		clearInterval(theInterval);
		raceStart();
	}
};

const startPrepTime = () => {
	isPrepBegin = true;
	if (sfx.mainThemeAudio) {
		try { sfx.mainThemeAudio.volume = 0.8; } catch (e) {}
		playAudio(sfx.mainThemeAudio);
	}
	const limit = new Date().getTime() + prepDuration;
	theInterval = setInterval(() => prepInterval(limit), 10);
	syncTimerUI();
};

const raceInterval = (beginTime) => {
	const nowTime = new Date().getTime();
	elapsedTime = nowTime - beginTime;

	toDisplayHtml(msToArrTime(elapsedTime));

	if (elapsedTime >= raceDuration) {
		playAudio(sfx.timesUpAudio);
		pauseAudio(sfx.mainThemeAudio);
		toDisplayHtml(msToArrTime(raceDuration));
		clearInterval(theInterval);
		isTimerStart = false;
		syncTimerUI();
	}
};

const raceStart = () => {
	isIdle = true;
	pauseAudio(sfx.mainThemeAudio);
	playAudio(sfx.prepare);

	const modeEl = document.getElementById('mode');
	if (modeEl) {
		modeEl.innerHTML = "GET READY...";
		modeEl.className = "mode-pill mode-prep";
	}

	// 6989ms adala durasi dari audio prepare jika ada
	setTimeout(() => {
		playAudio(sfx.start);
		resetAudioTime(sfx.mainThemeAudio);
		if (sfx.mainThemeAudio) {
			try { sfx.mainThemeAudio.volume = 0.4; } catch (e) {}
			playAudio(sfx.mainThemeAudio);
		}
		isIdle = false;
		isRaceBegin = true;

		const beginTime = new Date().getTime();
		theInterval = setInterval(() => raceInterval(beginTime), 10);
		syncTimerUI();
	}, 6989);
};

const teamReachFinish = (teamName) => {
	playAudio(sfx.applauseAudio);

	switch (teamName) {
		case "a":
			isAFinished = true;
			break;
		case "b":
			isBFinished = true;
			break;
	}

	if (isAFinished && isBFinished) {
		pauseAudio(sfx.mainThemeAudio);
		pauseAudio(sfx.applauseAudio);
		playAudio(sfx.raceEndAudio);
		clearInterval(theInterval);
		isTimerStart = false;
	}
	syncTimerUI();
};

const checkpointTeam = (teamName) => {
	if (sfx.checkpoint) {
		pauseAudio(sfx.checkpoint);
		resetAudioTime(sfx.checkpoint);
		playAudio(sfx.checkpoint);
	}

	teamTimes[teamName].push(elapsedTime);
	printAllLaps();

	if (teamTimes[teamName].length === parseInt(setting.nLap)) {
		teamReachFinish(teamName);
	}
};

// Displaying main timer
const toDisplayHtml = (formatedTime) => {
	const disp = document.getElementById('disp');
	const dispMs = document.getElementById('dispMs');
	if (disp) disp.innerHTML = formatedTime[0] + ":" + formatedTime[1];
	if (dispMs) dispMs.innerHTML = "." + formatedTime[2];
};

// Format from number ms to min, sec, ms
const msToArrTime = (nMs) => {
	const addPrefix = (n) => (n < 10 ? "0" + n : "" + n);
	const safeMs = Math.max(0, nMs);

	const min = addPrefix(Math.floor(safeMs / 60000));
	const sec = addPrefix(Math.floor((safeMs - min * 60000) / 1000));
	const ms = addPrefix(Math.floor((safeMs - sec * 1000 - min * 60000) / 10));

	return [min, sec, ms];
};
