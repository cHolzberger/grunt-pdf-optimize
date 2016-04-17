var cmd = [
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite"
];

var default_options = {
  gs_command: "gs"
  quality: "ebook",
  compatibility_level: "1.4"
}

var shell = require("shelljs");
var _ = require("underscore");
var fs = require("fs"); 

module.exports = function(grunt) {
    grunt.registerMultiTask('pdf-optimize', function() {
        grunt.subhead("Running pdf-optimize");
        var count = 0;
        var size_before = 0;
        var size_after = 0;

        var options = this.options (default_options);
        _.each(this.files, function(file) {
            if ( !grunt.file.isFile(file.src[0])) {
                console.error("Input File does not exist: " + file.src[0]);
                return;
            }

            if ( grunt.file.isFile(file.dest)) {
                console.log("Output file " + file.dest + " allready exists skipping");
                return;
            }

            var run = _.clone(cmd);

            run.push("-dPDFSETTINGS=/"+options.quality);
            run.push("-dCompatibilityLevel="+options.compatibility_level);

            run.push("-sOutputFile=" + file.dest);
            run.push(file.src[0]);
            var rcmd = options.gs_command + " " + run.join(" ");
            //console.log(process.cwd());
            //console.log("Optimizing " + file.src[0]);
            //console.log("Running " + rcmd);


            var ret = shell.exec(rcmd, {
                silent: true
            });
            if (ret) {
                count++;
                size_before += fs.statSync(file.src[0]);
                size_after += fs.statSync(dest);

                grunt.ok("Optimized " + file.src[0]);
            } else {
                grunt.console.error("Failed optimizing " + file.src[0]);
            }

            grunt.subhead("Optimized " + count + " files");
            grunt.log("Size before: " + (size_before / 1024 / 1024) + " MiB");
            grunt.log("Size after: " + (size_after / 1024 / 1024) + "MiB");
            grunt.log("Saved: " + ((size_after - size_before) / 1024 / 1024) + "MiB");

        });
    });
};
