let skins = [];

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

function buildBaseSkinPreview(skin_id) {
	return $("<p>test</p>");
}

$(window).on("load", () => {
    console.log("Page loaded");

	$.getJSON("dex.json", (data) => {
		skins = data;
		console.log("Fetched skins");

		buildBaseSkinPreview(0).appendTo($("#skin-list"));
	});

	$("#options-btn").on("click", (e) => {
		toggleOptionsVisible();
	});
});