const { createFilter } = require("@rollup/pluginutils");
var fs = require('fs');

const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

module.exports = function shaderMinifier(userOptions = {}) {
    const options = Object.assign(
        {
            include: [
                '**/*.vs',
                '**/*.fs',
                '**/*.vert',
                '**/*.frag',
                '**/*.glsl',
                '**/*.module.glsl'
            ]
        },
        userOptions
    );

	const filter = createFilter(options.include, options.exclude);

    return {
        name: 'shaderMinifier',

		buildStart() {
			
			if (!fs.existsSync("./tmp")) {

				fs.mkdirSync("./tmp");
				
			}

		},
		buildEnd() {

			if (fs.existsSync("./tmp")) {

				return fs.promises.rm("./tmp", { recursive: true, force: true, }, () => {});

			}
			
		},
        async transform(code, id) {
			
			if( !filter(id) ) return;

			code = code.match(/(?<=export\sdefault \").*?(?=\"\;\s\/\/\seslint\-disable\-line)/)[0] || ''
			code = code.replaceAll("\\n", "\n")
			code = code.replaceAll("\\t", "\t")
			code = code.replaceAll("precision highp float;", "\/\/\[\nprecision highp float;\n\/\/\]\n")

			let fileName = id.replaceAll('/', "_") + new Date().getTime();
			let inputFilePath = `./tmp/${fileName}_in.txt`;
			let outputFilePath = `./tmp/${fileName}_out.txt`;

			await fs.promises.writeFile( inputFilePath, code );

			let args = '--format text --preserve-externals'

			if( id.indexOf( '.module.glsl') > -1 ) {

				args += " --no-remove-unused"
				args += " --no-renaming"
				
			}

			// MINIFIER!!
			await exec(`shader_minifier.exe ${inputFilePath} -o ${outputFilePath} ${args}` )
			
			let compiledCode = await fs.promises.readFile(outputFilePath, 'utf-8')
			
			fs.unlinkSync( inputFilePath );
			fs.unlinkSync( outputFilePath );

            return {
                code:  `export default ${JSON.stringify(compiledCode)}; // eslint-disable-line`,
                map: { mappings: '' }
            };
        }
    };
};
