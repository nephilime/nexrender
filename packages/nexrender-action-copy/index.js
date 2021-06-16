const fs = require('fs')
const {name} = require('./package.json')
const path = require('path')
const sufix = "_ext"

module.exports = (job, settings, { input, output }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);
	const output_orig = output;
	output += sufix;
	console.log(output);

    /* output is a directory, save to input filename */
    if (fs.existsSync(output) && fs.lstatSync(output).isDirectory()) {
        output = path.join(output, path.basename(input));
    }

    /* plain asset stream copy */
    const rd = fs.createReadStream(input)
    const wr = fs.createWriteStream(output)
	//const rn = fs.renameSync(output, output_orig)

    return new Promise(function(resolve, reject) {
        rd.on('error', reject)
        wr.on('error', reject)
        wr.on('finish', () => {
			//await console.log("sleep start");
		    setTimeout(() => { fs.renameSync(output,output_orig); }, 2000);
			//await console.log("sleep end");
			//fs.renameSync(output, output_orig); 
			resolve(job);
			console.log("done");
			
		})

        rd.pipe(wr);
		

		
    }).catch((error) => {
        rd.destroy()
        wr.end()
        throw error
    })

	/* deleting sifix 
	return new Promise(fs.rename(output, output_orig, (err) => {
	console.log("start rename");
  	if (err) throw err;
  		console.log('Rename complete!');
	});
	);                */
	
}
