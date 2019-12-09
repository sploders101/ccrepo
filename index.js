/*
    URL structure
        /ccfiles
            /upload (POST): uploads a file
                /$filepath
                    [$filepath]: path where file should be uploaded
                    [body]: contents of file
            /ls (GET): returns lua-parseable list of files in a directory
                /$folderpath
                    [$folderpath]: path to the folder which should be opened
            /download (GET): downloads a file stored on the repo
                /$filepath
                    [$filepath]: path to the requested file
*/

//var bodyParser = require("body-parser");
// const urlEncode = require("urlencode");
const fs = require("fs");
const rmdir = require("rmdir");
const util = require("util");
const express = require("express");

const existsAsync = util.promisify(fs.exists);
const mkdirAsync = util.promisify(fs.mkdir);
const readFileAsync = util.promisify(fs.readFile);
const statAsync = util.promisify(fs.stat);

const app = module.exports = express.Router();

app.get("/",function(req,res) {
	res.header("Location","http://shaunkeys.com/ccfiles/download/utils/update")
	res.status(301).send();
});
app.use("/upload", async function(req,res) {
		if (req.path.indexOf("..")>=0) {
			res.send("I CALL HAX!\n");
			return;
		}
		filePath = req.path.replace("/","");
		//Does the file exist in a subdirectory? If so, make sure they exist
		if(filePath.indexOf("/")>=0) {

			var folders = filePath.split("/");
			var checkedFolders = [];

			//Do this for each folder
			for (var i=0;i<folders.length-1;i++) {
				//Add this folder to the list of checked folders, then check it
				checkedFolders.push(folders[i]);
				if(!(await existsAsync(`${__dirname}/repo/static/${checkedFolders.join("/")}`))) {

					await mkdirAsync(`${__dirname}/repo/static/${checkedFolders.join("/")}`);

				}
			}

		}

		//Go ahead and write it

		fs.writeFile(`${__dirname}/repo/static${req.path}`, req.query.data, function(err) {
			if(!err) {
				console.log(`${__dirname}/repo/static${req.path}`);
				console.dir(req.query);
				res.send("File uploaded successfully.");
			} else {
				res.status(500).send("Could not write file. Please check console");
				console.log(err);
			}
		});

});
app.use("/mkdir", async function(req,res) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	if(!await existsAsync(`${__dirname}/repo/static/${req.path}`)) {
		await mkdirAsync(`${__dirname}/repo/static/${req.path}`);
		res.send("true");
	} else {
		res.send("false");
	}
});
app.use("/rm", async function(req,res) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	if (await existsAsync(`${__dirname}/repo/static/${dir}`)) {
		rmdir(`${__dirname}/repo/static/${dir}`);
		res.send("true");
	} else {
		res.send("false");
	}
});
app.use("/ls", async function(req,res) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	if (await existsAsync(`${__dirname}/repo/static/${dir}`)) {
		const stats = await statAsync(`${__dirname}/repo/static/${dir}`);
		if(stats.isDirectory()) {
			fs.readdir(`${__dirname}/repo/static/${dir}`,function(err,files) {
				res.send("{\""+files.join("\",\"")+"\"}");
			});
		} else {
			res.send("Not a directory.");
		}
	} else {
		res.send("File not found.");
	}
});
app.use("/download", async function(req,res,next) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	if (await existsAsync(`${__dirname}/repo/static/${dir}`)) {
		const stats = await statAsync(`${__dirname}/repo/static/${dir}`);
		if(stats.isDirectory()) {
			res.send("Is a directory.");
		} else {
			res.write(await readFileAsync(`${__dirname}/repo/static/${dir}`));
			res.end();
		}
	} else {
		res.status(404).send("File not found.");
	}
});
app.use("/exists", async function(req,res) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	res.send((await existsAsync(`${__dirname}/repo/static/${dir}`) ? ("true") : ("false")));
});
app.use("/isDir", async function(req,res) {
	if (req.path.indexOf("..")>=0) {
		res.send("I CALL HAX!\n");
		return;
	}
	var dir = req.path.replace("/","");
	if(await existsAsync(`${__dirname}/repo/static/${dir}`)) {
		const stats = await statAsync(`${__dirname}/repo/static/${dir}`);
		if(stats.isDirectory()) {
			res.send("true");
		} else {
			res.send("false");
		}
	} else {
		res.send("false");
	}
});
