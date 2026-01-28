export default {
	permalink: function (data) {
		// Don't write our critical included styles to the output directory
    // They are included inline in the HTML head
		const criticalStyles = ['main', 'home', 'page', 'work-item'];
		if (criticalStyles.includes(data.page.fileSlug)) {
			return false;
		}
	},
};