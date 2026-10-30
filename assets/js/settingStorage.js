const defaultSetting = {
	'prep_time': 5, //second
	'race_duration': 15, //second
	'compName': 'Race Stopwatch',
	'team_a_name': 'Tim A',
	'team_b_name': 'Tim B',
	'lap_a_name': 'LAP A',
	'lap_b_name': 'LAP B',
	'midText': 'VS / Laps',
	'nLap': 3,
	'isBgmEnabled': true,
	'isSfxEnabled': true
};

const compNameInput = document.getElementById('compNameInput');
const inputPrepTime = document.getElementById('prep_time');
const inputRaceDuration = document.getElementById('race_duration');
const aTeam = document.getElementById('a_team_input');
const bTeam = document.getElementById('b_team_input');
const lapAInput = document.getElementById('lap_a_input');
const lapBInput = document.getElementById('lap_b_input');
const nLapInput = document.getElementById('nLapInput');
const midTextInput = document.getElementById('midTextInput');

function getSetting() {
	if (typeof (Storage) !== 'undefined') {
		const storage = localStorage.getItem('krc_timer_setting');
		if (!storage) {
			localStorage.setItem('krc_timer_setting', JSON.stringify(defaultSetting));
		}
	}

	//get Item from localStorage
	let settings = defaultSetting;
	try {
		const raw = localStorage.getItem('krc_timer_setting');
		if (raw) {
			settings = { ...defaultSetting, ...JSON.parse(raw) };
		}
	} catch (e) {
		settings = defaultSetting;
	}

	// Ensure audio booleans & lap names are properly initialized
	if (settings.isBgmEnabled === undefined) settings.isBgmEnabled = true;
	if (settings.isSfxEnabled === undefined) settings.isSfxEnabled = true;
	if (!settings.lap_a_name) settings.lap_a_name = defaultSetting.lap_a_name;
	if (!settings.lap_b_name) settings.lap_b_name = defaultSetting.lap_b_name;

	// Update DOM
	const titleEl = document.getElementById('title');
	if (titleEl) titleEl.innerHTML = settings.compName;

	const headerTitleEl = document.getElementById('headerTitle');
	if (headerTitleEl) headerTitleEl.innerHTML = settings.compName;

	const midTextEl = document.getElementById('midText');
	if (midTextEl) midTextEl.innerHTML = settings.midText;

	const teamAEl = document.getElementById('team_a_name');
	if (teamAEl) teamAEl.innerHTML = settings.team_a_name;

	const teamBEl = document.getElementById('team_b_name');
	if (teamBEl) teamBEl.innerHTML = settings.team_b_name;

	const btnLapA = document.getElementById('btnLapAText');
	if (btnLapA) btnLapA.innerText = settings.lap_a_name;

	const btnLapB = document.getElementById('btnLapBText');
	if (btnLapB) btnLapB.innerText = settings.lap_b_name;

	if (inputPrepTime) inputPrepTime.value = settings.prep_time;
	if (compNameInput) compNameInput.value = settings.compName;
	if (inputRaceDuration) inputRaceDuration.value = settings.race_duration;
	if (aTeam) aTeam.value = settings.team_a_name;
	if (bTeam) bTeam.value = settings.team_b_name;
	if (lapAInput) lapAInput.value = settings.lap_a_name;
	if (lapBInput) lapBInput.value = settings.lap_b_name;
	if (nLapInput) nLapInput.value = settings.nLap;
	if (midTextInput) midTextInput.value = settings.midText;

	return settings;
}

function setSettings() {
	let current = defaultSetting;
	try {
		const stored = localStorage.getItem('krc_timer_setting');
		if (stored) current = JSON.parse(stored);
	} catch (e) {}

	const setting = {
		prep_time: inputPrepTime ? inputPrepTime.value : defaultSetting.prep_time,
		compName: compNameInput ? compNameInput.value : defaultSetting.compName,
		race_duration: inputRaceDuration ? inputRaceDuration.value : defaultSetting.race_duration,
		team_a_name: aTeam ? aTeam.value : defaultSetting.team_a_name,
		team_b_name: bTeam ? bTeam.value : defaultSetting.team_b_name,
		lap_a_name: lapAInput ? lapAInput.value : defaultSetting.lap_a_name,
		lap_b_name: lapBInput ? lapBInput.value : defaultSetting.lap_b_name,
		nLap: nLapInput ? nLapInput.value : defaultSetting.nLap,
		midText: midTextInput ? midTextInput.value : defaultSetting.midText,
		isBgmEnabled: current.isBgmEnabled !== undefined ? current.isBgmEnabled : defaultSetting.isBgmEnabled,
		isSfxEnabled: current.isSfxEnabled !== undefined ? current.isSfxEnabled : defaultSetting.isSfxEnabled,
	};

	localStorage.setItem('krc_timer_setting', JSON.stringify(setting));

	window.location.reload();
}
