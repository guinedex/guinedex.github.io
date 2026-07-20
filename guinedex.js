$(window).on("load", () => {
    console.log("Loaded");
	$.getJSON("dex.json", (data) => {
		console.log(data);
	});
});