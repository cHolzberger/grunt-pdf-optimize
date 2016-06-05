/**
 * @author Christian Holzberger <ch at mosaiksoftware.de> 
 * @license MIT
 * Copyright 2016 MOSAIK Software 
 */
var cmd = [
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite",
		"-dDetectDuplicateImages=true",
		"-dCompressFonts=true"
];

var default_options = {
  gs_command: "gs",
  quality: "ebook",
  compatibility_level: "1.4"
}

var shell = require("shelljs");
var _ = require("underscore");
var fs = require("fs"); 

module.exports.quality = {
	SCREEN: "screen", // best
	EBOOK: "ebook",
	PRINTER: "printer",
	PREPRESS: "prepress",
	DEFAULT: "default" // worst
};


module.exports = function(grunt) {
    grunt.registerMultiTask('pdf-optimize', function() {
        grunt.log.subhead("Running pdf-optimize");
        var count = 0;
        var size_before = 0;
        var size_after = 0;

        var options = this.options (default_options);
        _.each(this.files, function(file) {
            if ( !grunt.file.isFile(file.src[0])) {
                grunt.log.error("Input File does not exist: " + file.src[0]);
                return;
            }

            if ( grunt.file.isFile(file.dest)) {
                grunt.log.writeln("Output file allready exists skipping");
                return;
            }

            var run = _.clone(cmd);

            run.push("-dPDFSETTINGS=/"+options.quality);
            run.push("-dCompatibilityLevel="+options.compatibility_level);

            run.push("-sOutputFile=" + file.dest);
            run.push(file.src[0]);
            var rcmd = options.gs_command + " " + run.join(" ");
            var ret = shell.exec(rcmd, {
                silent: true
            });
            if (ret) {
                var file_size_before = fs.statSync(file.src[0]).size;
                var file_size_after = fs.statSync(file.dest).size;

								var ratio = (file_size_after / file_size_before).toFixed(2);
								if ( ratio > 0.9 ) {
									fs.unlinkSync(file.dest)
									fs.linkSync(file.src[0], file.dest);
									
									grunt.log.ok("Could not optimize " + file.src[0]);
								} else {
									// stats
                	count++;
									size_before += file_size_before;
									size_after += file_size_after;
									
                	grunt.log.ok("Optimized " + file.src[0] + " [x"+ratio+"]");
								}
            } else {
                grunt.log.error("Failed optimizing " + file.src[0]);
            }

            
        });
				grunt.log.subhead("Optimized " + count + " files");
        grunt.log.writeln("Size before: " + (size_before / 1024 / 1024) + " MiB");
        grunt.log.writeln("Size after: " + (size_after / 1024 / 1024) + "MiB");
        grunt.log.writeln("Saved: " + ((size_after - size_before) / 1024 / 1024) + "MiB");

    });
};
