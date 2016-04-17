// Test gruntfile for pdf optimizer grunt plugin
//

module.exports = function(grunt) {
	grunt.loadTaks("../src");

	grunt.initConfig ( {
		"pdf-optimize": {
			"test1": {
				expand: true,
        src: ["input/text1.pdf"],
        dest: "output/"
			}
		}
	});
}
