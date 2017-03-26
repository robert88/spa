var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
require("colors")
var wake = require("../../toolLib/fileWake.js")
// var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

function getFile(dir, type) {
	var files = {};
	fs.readdirSync(dir)
		.filter(function(file) {
			new RegExp('\\.' + type + '$').test(file) && (files[file.replace('.' + type, '')] = dir + file.replace('.' + type, ''));
		});
	return files;
}


//wake.remove('./web/static',false); // 要先将文件夹内的文件删掉

var js = wake.findFile('./web/static_src/js/pages/', 'js');
// var js = getFile('./web/static_src/js/pages/', 'js');
// console.log(js)
   var obj={};
   for(var i=0;i<js.length;i++){
   		obj[ js[i].slice(js[i].lastIndexOf("\\")+1,js[i].length ).replace(".js","") ]=js[i].replace(/\\/g,"/").replace(".js","");
   }

//consoltes/
module.exports = {
	entry: obj,
	output: {
		path: './web/static',
		filename: 'js/[name].js',
		chunkFilename: 'js/[name].chunk.js', // 异步模块命名规则
		publicPath: 'http://www.livestar.com/static/'
	},
	module: {
		loaders: [{
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		}, {
			test: /\.(png|jpg)$/,
			loader: 'url-loader?limit=8192'
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		function() {
			this.plugin('done', function(stats) {
				console.log(stats)
//				var temp = stats.toJson().assetsByChunkName;
//				console.log("temp".red);
//				var manifestJS = {};
//				var manifestCSS = {};
//				
//				for (var i in temp) {
//					var name = (temp[i] instanceof Array ? temp[i][0] : temp[i]);
//					if (/\.js$/.test(name))
//						manifestJS[i + '.js'] = name.replace('js/', '');
//					else if ((/\.css$/.test(temp[i])))
//						manifestCSS[i.replace('css/', '') + '.css'] = name.replace('css/', '');
//				}
//				require('fs').writeFileSync(path.join(__dirname, 'rev/js', 'rev-manifest.json'), JSON.stringify(manifestJS));
//				// require('fs').writeFileSync(path.join(__dirname, 'rev/css', 'rev-manifest.json'), JSON.stringify(manifestCSS));
			});
		}
	],
	alias: {

	}
}