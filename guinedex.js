//let skins = [];
let skins = [];
let saved = [];
let savedCookieKey = "saved";
let searchOptions = {
	sortBy: "ID",
	sortByReverse: false,
	anyField: "",
	anyFieldFuzzy: false,
	name: "",
	nameFuzzy: false,
	description: "",
	descriptionFuzzy: false,
	abilities: "",
	abilitiesFuzzy: false,
	crates: [],
	rarities: [],
	apexOnly: false,
	elements: [],
	attackTargets: [],
	hpLow: 0,
	hpHigh: 999,
	atkLow: 0,
	atkHigh: 999,
	defLow: 0,
	defHigh: 999,
	spdLow: 0,
	spdHigh: 999
};

function setOptionsVisible(visible) {
	if (visible) {
		$("#options").removeClass("d-none");
		$("#skin-info").addClass("d-none");
		$("#options-btn-arrow").text("[<]");
	} else {
		$("#options").addClass("d-none");
		$("#skin-info").removeClass("d-none");
		$("#options-btn-arrow").text("[>]");
	}
}
function toggleOptionsVisible() {
	setOptionsVisible($("#options").hasClass("d-none"))
}

function getSkin(skin_id) {
	for (let skin of skins) {
		if (skin.id == skin_id)
			return skin;
	}
	console.log(`No skin for id ${skin_id}`);
	return null;
}

function getImagePath(skin_id) {
	return "skins/" + getSkin(skin_id).image.slice(4);
}

function getRarity(skin_id) {
	let rarities = {"C": "common", "UC": "uncommon", "R": "rare", "UR": "ultrarare", "L": "legendary"};
	return rarities[getSkin(skin_id).rarity];
}

// common base for cards that bring up the skin preview
function buildBaseCard(skin_id, cardtype) {
	return $(`
	<button id="${cardtype}-${skin_id}" type="button" class="btn border-${getRarity(skin_id)} width-29 m-2p p-5p">
		<img src="${getImagePath(skin_id)}" class="full-width">
	</button>
	`);
}

let handleSave;

// create handler for #save-skin button
function createSaveHandler(skin_id) {
	return (e) => handleSave(skin_id);
}

function updateSaveButton(skin_id) {
	let $save_skin = $("#save-skin");
	$save_skin.parent().removeClass("d-none");
	$save_skin.off("click");
	$save_skin.on("click", createSaveHandler(skin_id));
	let is_saved = saved.includes(skin_id);
	let $save_skin_text = $("#save-skin-text");
	if (is_saved) {
		$save_skin.removeClass("btn-success");
		$save_skin.addClass("btn-danger");
		$save_skin_text.text("Unsave skin");
	} else {
		$save_skin.removeClass("btn-danger");
		$save_skin.addClass("btn-success");
		$save_skin_text.text("Save skin");
	}
}

let updatePreview;

// card in search results
function buildSkinCard(skin_id) {
	let $skinCard = buildBaseCard(skin_id, "skin");
	$skinCard.on("click", clickEvent => {
		updatePreview(skin_id);
		updateSaveButton(skin_id);
	});
	return $skinCard;
}

// card in saved skins list
function buildSavedCard(skin_id) {
	let $skinCard = buildBaseCard(skin_id, "saved");
	$skinCard.on("click", clickEvent => {
		updatePreview(skin_id);
		updateSaveButton(skin_id);
	});
	return $skinCard;
}

handleSave = (skin_id) => {
	let should_save = !saved.includes(skin_id);
	if (should_save) {
		saved.push(skin_id);
		Cookies.set(savedCookieKey, saved);
		buildSavedCard(skin_id).appendTo($("#saved-list"));
	} else {
		let saved_index = saved.indexOf(skin_id);
		if (saved_index > -1)
			saved.splice(saved_index, 1);
		Cookies.set(savedCookieKey, saved);
		$(`#saved-${skin_id}`).remove();
	}
	updateSaveButton(skin_id);
}

// common skin preview, from search result or saved skin
function buildSkinPreview(skin_id) {
	let skin = getSkin(skin_id)
	let rarity = getRarity(skin_id);
	let elem = skin.element;
	let elem_letter = elem.toLowerCase()[0];
	let elem_color = skin.apex ? "apex" : elem_letter;
	return $(`
		<h5 class="card-title text-center text-${rarity}">${skin.name}</h5>
		<h5 class="card-subtitle text-center text-${rarity}">${rarity[0].toUpperCase()+rarity.slice(1)}</h5>
		<div class="d-inline-block position-relative start-50 translate-middle-x">
			<img src="element_${elem_letter}.png"><h5 class="card-subtitle d-inline-block ms-2 text-${elem_color}">${(skin.apex ? "Apex " : "") + elem}</h5>
		</div>
		<br>
		<div class="border border-2 border-${rarity} rounded mt-1 bg-dark">
			<img src="${getImagePath(skin_id)}" class="width-20 position-relative start-50 translate-middle-x">
		</div>
		<div class="my-2 py-2 bg-dark rounded">
			<p class="text-center my-0 text-light">${skin.description}</p>
		</div>
		<div class="d-inline-block width-10 min-width-50 p-1 border rounded stat-hp">
			<p class="fs-6 text-center my-0">HP</p>
			<p class="text-light text-center my-0">${skin.health}</p>
		</div>
		<div class="d-inline-block width-10 min-width-50 p-1 border rounded stat-atk">
			<p class="fs-6 text-center my-0">ATK</p>
			<p class="text-light text-center my-0">${skin.attack}</p>
		</div>
		<div class="d-inline-block width-10 min-width-50 p-1 border rounded stat-def">
			<p class="fs-6 text-center my-0">DEF</p>
			<p class="text-light text-center my-0">${skin.defense}</p>
		</div>
		<div class="d-inline-block width-10 min-width-50 p-1 border rounded stat-spd">
			<p class="fs-6 text-center my-0">SPD</p>
			<p class="text-light text-center my-0">${skin.speed}</p>
		</div>
		<div class="d-inline-block width-10 min-width-50 p-1 border rounded stat-id">
			<p class="fs-6 text-center my-0">ID</p>
			<p class="text-light text-center my-0">${skin.id}</p>
		</div>
		<br>
		<p>Targets: ${skin.attack_style}</p>
		<hr>
		<p class="mb-1 fs-5">ABILITIES</p>
		${
			skin.abilities.map((ability) => {
				let reg = /(\[.+?\]) (.+)/;
				let matches = reg.exec(ability);
				return `
					<div class="border border-dark rounded mb-1">
						<p class="mx-1 my-1">${matches[1]}</p>
						<p class="mx-1 my-1">${matches[2]}</p>
					</div>
				`;
			}).join("")
		}
		${
			(() => {
				if (!skin.supporter_ability)
					return "";
				let reg = /(\[.+?\]) (.+)/;
				let matches = reg.exec(skin.supporter_ability);
				return `
					<p class="mb-1 fs-5">SUPPORTER ABILITY</p>
					<div class="border border-dark rounded mb-1">
						<p class="mx-1 my-1">${matches[1]}</p>
						<p class="mx-1 my-1">${matches[2]}</p>
					</div>
				`;
			})()
		}
		<hr>
		<p class="fs-4">Crate sources</p>
		<div>
			${
				skin.crate_sources.map((crate) => {
					return `
						<div class="d-inline-block p-1 border rounded">
							<p class="text-center my-0">${crate}</p>
						</div>
					`;
				}).join("")
			}
		</div>
	`);
}

updatePreview = (skin_id) => {
	let $skin_info_body = $("#skin-info-body");
	$skin_info_body.children().remove();
	buildSkinPreview(skin_id).appendTo($skin_info_body);
}

function statFallback(stat, fallback) {
	return stat ? stat : fallback;
}

function registerOptionHandlers() {
	$("#search_sort").on("change", applySearchOptions);
	$("#search_sort_reverse").on("change", applySearchOptions);
	$("#search_any").on("input", applySearchOptions);
	$("#search_any_fuzzy").on("change", applySearchOptions);
	$("#search_name").on("input", applySearchOptions);
	$("#search_description").on("input", applySearchOptions);
	$("#search_abilities").on("input", applySearchOptions);
	$("#search_abilities_fuzzy").on("change", applySearchOptions);
	$("#search_crate_normal").on("change", applySearchOptions);
	$("#search_crate_daily").on("change", applySearchOptions);
	$("#search_crate_gold").on("change", applySearchOptions);
	$("#search_crate_spring").on("change", applySearchOptions);
	$("#search_crate_summer").on("change", applySearchOptions);
	$("#search_crate_fall").on("change", applySearchOptions);
	$("#search_crate_winter").on("change", applySearchOptions);
	$("#search_rarity_c").on("change", applySearchOptions);
	$("#search_rarity_uc").on("change", applySearchOptions);
	$("#search_rarity_r").on("change", applySearchOptions);
	$("#search_rarity_ur").on("change", applySearchOptions);
	$("#search_rarity_l").on("change", applySearchOptions);
	$("#search_element_apex").on("change", applySearchOptions);
	$("#search_element_g").on("change", applySearchOptions);
	$("#search_element_f").on("change", applySearchOptions);
	$("#search_element_b").on("change", applySearchOptions);
	$("#search_element_p").on("change", applySearchOptions);
	$("#search_element_c").on("change", applySearchOptions);
	$("#search_element_m").on("change", applySearchOptions);
	$("#search_target_hp_high").on("change", applySearchOptions);
	$("#search_target_atk_high").on("change", applySearchOptions);
	$("#search_target_def_high").on("change", applySearchOptions);
	$("#search_target_spd_high").on("change", applySearchOptions);
	$("#search_target_random").on("change", applySearchOptions);
	$("#search_target_hp_low").on("change", applySearchOptions);
	$("#search_target_atk_low").on("change", applySearchOptions);
	$("#search_target_def_low").on("change", applySearchOptions);
	$("#search_target_spd_low").on("change", applySearchOptions);
	$("#search_hp_low").on("input", applySearchOptions);
	$("#search_hp_high").on("input", applySearchOptions);
	$("#search_atk_low").on("input", applySearchOptions);
	$("#search_atk_high").on("input", applySearchOptions);
	$("#search_def_low").on("input", applySearchOptions);
	$("#search_def_high").on("input", applySearchOptions);
	$("#search_spd_low").on("input", applySearchOptions);
	$("#search_spd_high").on("input", applySearchOptions);
}

// parse settings from options html
function fetchSearchOptions() {
	searchOptions.sortBy = $("#search_sort").val();
	searchOptions.sortByReverse = $("#search_sort_reverse").prop("checked");
	searchOptions.anyField = $("#search_any").val();
	searchOptions.anyFieldFuzzy = $("#search_any_fuzzy").prop("checked");
	searchOptions.name = $("#search_name").val();
	//searchOptions.nameFuzzy = false
	searchOptions.description = $("#search_description").val();
	//searchOptions.descriptionFuzzy = false
	searchOptions.abilities = $("#search_abilities").val();
	searchOptions.abilitiesFuzzy = $("#search_abilities_fuzzy").prop("checked");
	searchOptions.crates = [];
	if ($("#search_crate_normal").prop("checked")) searchOptions.crates.push("normal");
	if ($("#search_crate_daily").prop("checked")) searchOptions.crates.push("daily");
	if ($("#search_crate_gold").prop("checked")) searchOptions.crates.push("gold");
	if ($("#search_crate_spring").prop("checked")) searchOptions.crates.push("spring");
	if ($("#search_crate_summer").prop("checked")) searchOptions.crates.push("summer");
	if ($("#search_crate_fall").prop("checked")) searchOptions.crates.push("fall");
	if ($("#search_crate_winter").prop("checked")) searchOptions.crates.push("winter");
	searchOptions.rarities = [];
	if ($("#search_rarity_c").prop("checked")) searchOptions.rarities.push("c");
	if ($("#search_rarity_uc").prop("checked")) searchOptions.rarities.push("uc");
	if ($("#search_rarity_r").prop("checked")) searchOptions.rarities.push("r");
	if ($("#search_rarity_ur").prop("checked")) searchOptions.rarities.push("ur");
	if ($("#search_rarity_l").prop("checked")) searchOptions.rarities.push("l");
	searchOptions.apexOnly = $("#search_element_apex").prop("checked");
	searchOptions.elements = [];
	if ($("#search_element_g").prop("checked")) searchOptions.elements.push("g");
	if ($("#search_element_f").prop("checked")) searchOptions.elements.push("f");
	if ($("#search_element_b").prop("checked")) searchOptions.elements.push("b");
	if ($("#search_element_p").prop("checked")) searchOptions.elements.push("p");
	if ($("#search_element_c").prop("checked")) searchOptions.elements.push("c");
	if ($("#search_element_m").prop("checked")) searchOptions.elements.push("m");
	searchOptions.attackTargets = [];
	if ($("#search_target_hp_high").prop("checked")) searchOptions.attackTargets.push("hp_high");
	if ($("#search_target_atk_high").prop("checked")) searchOptions.attackTargets.push("atk_high");
	if ($("#search_target_def_high").prop("checked")) searchOptions.attackTargets.push("def_high");
	if ($("#search_target_spd_high").prop("checked")) searchOptions.attackTargets.push("spd_high");
	if ($("#search_target_random").prop("checked")) searchOptions.attackTargets.push("random");
	if ($("#search_target_hp_low").prop("checked")) searchOptions.attackTargets.push("hp_low");
	if ($("#search_target_atk_low").prop("checked")) searchOptions.attackTargets.push("atk_low");
	if ($("#search_target_def_low").prop("checked")) searchOptions.attackTargets.push("def_low");
	if ($("#search_target_spd_low").prop("checked")) searchOptions.attackTargets.push("spd_low");
	searchOptions.hpLow = statFallback($("#search_hp_low").val(), 0);
	searchOptions.hpHigh = statFallback($("#search_hp_high").val(), 999);
	searchOptions.atkLow = statFallback($("#search_atk_low").val(), 0);
	searchOptions.atkHigh = statFallback($("#search_atk_high").val(), 999);
	searchOptions.defLow = statFallback($("#search_def_low").val(), 0);
	searchOptions.defHigh = statFallback($("#search_def_high").val(), 999);
	searchOptions.spdLow = statFallback($("#search_spd_low").val(), 0);
	searchOptions.spdHigh = statFallback($("#search_spd_high").val(), 999);
}

function setSkinVisible(skin_id, visible) {
	let $skinCard = $(`#skin-${skin_id}`);
	if (visible)
		$skinCard.removeClass("d-none");
	else
		$skinCard.addClass("d-none");
}

function arrayElementsInclude(array, substring, any) {
	if (any) {
		for (let elem of array) {
			if (elem.includes(substring))
				return true;
		}
		return false;
	} else {
		for (let elem of array) {
			if (!elem.includes(substring))
				return false;
		}
		return true;
	}
}

function formatAttackTarget(attackTarget) {
	let attackTargets = {"highest-hp enemy": "hp_high",
		"highest-attack enemy": "atk_high",
		"highest-defense enemy": "def_high",
		"fastest enemy": "spd_high",
		"random enemy": "random",
		"lowest-hp enemy": "hp_low",
		"lowest-attack enemy": "atk_low",
		"lowest-defense enemy": "def_low",
		"slowest enemy": "spd_low"};
	return attackTargets[attackTarget];
}

// update search results based on search options
function filterSearchResults() {
	// Sort
	let sortKey = searchOptions.sortBy.toLowerCase(); // works without a lookup dict so far
	// Build sorting algo
	let sortAlgo;
	{
		// Name and ID should sort by ascending by default, others sort descending
		let sortDirectionMap = {"name": "asc", "id": "asc"};
		let sortMainDesc = sortKey in sortDirectionMap ? sortDirectionMap[sortKey] == "desc" : true;
		// Fallback sorting value - alphabetical order
		let fallbackKey = "name";
		let sortFallbackDesc = fallbackKey in sortDirectionMap ? sortDirectionMap[fallbackKey] == "desc" : true;
		// Combine values (xor) which effectively reverse the list
		let doReverseMain = searchOptions.sortByReverse != sortMainDesc;
		let doReverseFallback = searchOptions.sortByReverse != sortFallbackDesc;
		// Special sort cases, e.g. rarity (L > UR > C)
		if (sortKey == "rarity") {
			// Rarity sorting
			let greaterOrder = doReverseMain ? -1 : 1;
			let lesserOrder = 0 - greaterOrder;
			let fallbackLesserOrder = doReverseFallback ? 1 : -1;
			let fallbackGreaterOrder = 0 - fallbackLesserOrder;
			let rarityMap = {"C": 0, "UC": 1, "R": 2, "UR": 3, "L": 4};
			sortAlgo = (a, b) => {
				let aVal = rarityMap[a[sortKey]];
				let bVal = rarityMap[b[sortKey]];
				return (aVal > bVal ? greaterOrder : (aVal < bVal ? lesserOrder : (a.name < b.name ? fallbackLesserOrder : fallbackGreaterOrder)));
			};
		} else {
			// Default sort case

			// Standard ordering reversed if reverse is checked or if it has a different default sort direction
			let greaterOrder = doReverseMain ? -1 : 1;
			let lesserOrder = 0 - greaterOrder;
			// Fallback ordering, reversed if reverse is checked or if fallback order is different
			let fallbackLesserOrder = doReverseFallback ? 1 : -1;
			let fallbackGreaterOrder = 0 - fallbackLesserOrder;

			sortAlgo = (a, b) => {
				let aVal = a[sortKey];
				let bVal = b[sortKey];
				return aVal > bVal ? greaterOrder : (aVal < bVal ? lesserOrder : (a.name < b.name ? fallbackLesserOrder : fallbackGreaterOrder));
			};
		}
	}
	let sortedIDs = skins.toSorted(sortAlgo);
	sortedIDs = sortedIDs.map((skin) => skin.id);
	// detach and reattach via appending, to reorder them
	for (let sortedID of sortedIDs) {
		$(`#skin-${sortedID}`).detach().appendTo($("#skin-list"));
	}

	// Filter
	for (let skin_id of sortedIDs) {
		let skin = getSkin(skin_id);
		if (!skin)
			continue;

		let matchesFilter = true;
		// any field: name, description, abilities, supporter ability (1)
		let anyFieldTerms = [];
		if (!searchOptions.anyFieldFuzzy)
			anyFieldTerms.push(searchOptions.anyField.toLowerCase());
		else
			anyFieldTerms = searchOptions.anyField.toLowerCase().split(" ");
		for (let anyFieldTerm of anyFieldTerms) {
			if (!skin.name.toLowerCase().includes(anyFieldTerm) &&
					!skin.description.toLowerCase().includes(anyFieldTerm) &&
					!arrayElementsInclude(skin.abilities.map(
						(s) => s.toLowerCase()
					), anyFieldTerm, true) &&
					!skin.supporter_ability.toLowerCase().includes(anyFieldTerm)) {
				matchesFilter = false;
				break;
			}
		}
		// name search
		let nameTerms = [];
		if (!searchOptions.nameFuzzy)
			nameTerms.push(searchOptions.name.toLowerCase());
		else
			nameTerms = (searchOptions.name.toLowerCase().split(" "));
		for (let nameTerm of nameTerms) {
			if (!skin.name.toLowerCase().includes(nameTerm)) {
				matchesFilter = false;
				break;
			}
		}
		// description search
		let descriptionTerms = [];
		if (!searchOptions.descriptionFuzzy)
			descriptionTerms.push(searchOptions.description.toLowerCase());
		else
			descriptionTerms = (searchOptions.description.toLowerCase().split(" "));
		for (let descriptionTerm of descriptionTerms) {
			if (!skin.description.toLowerCase().includes(descriptionTerm)) {
				matchesFilter = false;
				break;
			}
		}
		// abilities search
		let abilitiesTerms = [];
		if (!searchOptions.abilitiesFuzzy)
			abilitiesTerms.push(searchOptions.abilities.toLowerCase());
		else
			abilitiesTerms = (searchOptions.abilities.toLowerCase().split(" "));
		for (let abilitiesTerm of abilitiesTerms) {
			if (!arrayElementsInclude(skin.abilities.map(
						(s) => s.toLowerCase()
					), abilitiesTerm, true)) {
				matchesFilter = false;
				break;
			}
		}
		// crates
		if (searchOptions.crates.length) {
			let inCrate = false;
			for (let crate of skin.crate_sources) {
				if (searchOptions.crates.includes(crate.toLowerCase()))
					inCrate = true;
			}
			if (!inCrate)
				matchesFilter = false;
		}
		// rarities
		if (searchOptions.rarities.length) {
			if (!searchOptions.rarities.includes(skin.rarity.toLowerCase()))
				matchesFilter = false;
		}
		// apex
		if (searchOptions.apexOnly && !skin.apex)
			matchesFilter = false;
		// elements
		if (searchOptions.elements.length) {
			if (!searchOptions.elements.includes(skin.element[0].toLowerCase()))
				matchesFilter = false;
		}
		// attack targets
		if (searchOptions.attackTargets.length) {
			if (!searchOptions.attackTargets.includes(formatAttackTarget(skin.attack_style.toLowerCase())))
				matchesFilter = false;
		}
		// hp stat
		if (skin.health < searchOptions.hpLow || skin.health > searchOptions.hpHigh)
			matchesFilter = false;
		// atk stat
		if (skin.attack < searchOptions.atkLow || skin.attack > searchOptions.atkHigh)
			matchesFilter = false;
		// def stat
		if (skin.defense < searchOptions.defLow || skin.defense > searchOptions.defHigh)
			matchesFilter = false;
		// spd stat
		if (skin.speed < searchOptions.spdLow || skin.speed > searchOptions.spdHigh)
			matchesFilter = false;

		if (matchesFilter)
			setSkinVisible(skin_id, true);
		else
			setSkinVisible(skin_id, false);
	}
}

// parse search options and update results, handler for events for all search options
function applySearchOptions() {
	fetchSearchOptions();
	filterSearchResults();
}

function skinsLoaded() {
	$("#skin-list").children().remove();
	for (let skin of skins) {
		buildSkinCard(skin.id).appendTo($("#skin-list"));
	}
}

function savedLoaded() {
	for (let saved_id of saved) {
		buildSavedCard(saved_id).appendTo($("#saved-list"));
	}
}

addEventListener("load", () => {
	// Fetch skin data from JSON file
	$.getJSON("dex.json", (data) => {
		skins = data;
		console.log("Fetched skins");

		skinsLoaded();
		applySearchOptions();

		// Only load cookie'd saved skins after skin data has been loaded
		let cookieSaved = Cookies.get(savedCookieKey);
		if (typeof cookieSaved == "string") {
			let listifiedSaved = cookieSaved.split(",").map((s) => parseInt(s)).filter((i) => i > 0);
			saved = listifiedSaved;
		}
		savedLoaded();
	});

	// Options button handler
	$("#options-btn").on("click", (e) => {
		toggleOptionsVisible();
	});

	// Search option handlers
	registerOptionHandlers();
});