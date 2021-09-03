const pup = require("puppeteer");
const axios = require("axios");
const { spawn } = require('child_process');
var option = process.argv[2];
var url = process.argv[3];

let title = ''
let istv = url.includes('#')

const getSlug = async (search) => {
	process.stdout.write(` Searching for ${search} =`)
	try {
		const res = await axios({method: 'get', url: `http://lookmovie.io/api/v1/movies/find/?q=${search}`})
		title = res.data.result[0].title
		return res.data.result[0].slug
	} catch(e){
		console.log("> Error, couldn't find that movie! Please refine your search")
		console.log(e)
		process.exit()
	}
}

const getMaster = async () => {
	process.stdout.write('=')
	try {
    const browser = await pup.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
		const page = await browser.newPage();

		await page.setRequestInterception(true)
		let slug = ''
		if(!istv){
			slug = await getSlug(url)
		} else {
			title = url.split('#')[1]
			slug = url
		}
		let openUrl = `http://lookmovie.io/${istv ? 'shows' : 'movies'}/view/${slug}`
		let reqUrl = ''

		page.on('request', req => {
			if(req.url().includes('.m3u8')){
				process.stdout.write('=')
				reqUrl = req.url()
			}
			req.continue()
		})

		await page.goto(openUrl)
		await browser.close()


		return reqUrl

	} catch(e){console.log('ERROR', e)}
}

const getIndex = async () => {
	process.stdout.write('=')
	let foundMaster = await getMaster()
	let res = await axios({method: 'get', url: foundMaster})
	let movieObj = {title: title, url: res.data[istv ? '480' : '480p']}

	switch(option){
		case 'download':
			console.log(`> Downloading ${movieObj.title}`)
			downloadFile(movieObj)
		case 'stream':
			streamFile(movieObj)
		case 'link':
			console.log("> ", movieObj.url)
		default:
			return
	}

	// if(option == 'download'){
	// 	console.log(`> Downloading ${movieObj.title}`)
	// 	downloadFile(movieObj)
	// } else if(option == 'link'){
	// 	console.log(movieObj.url)
	// } else if(option == 'stream'){
	// 	streamFile(movieObj)
	// }

}

const downloadFile = (obj) => {
	let args = [
		'-i', `${obj.url}`,
		'-c', 'copy',
		'-bsf:a', 'aac_adtstoasc',
		`${obj.title}.mp4` 
	]

	spawn('ffmpeg', args, {stdio: [process.stdin, process.stdout, process.stderr]})
}

const streamFile = (obj) => {
	let args = [
		'--no-border', `${obj.url}`
	]

	spawn('mpv', args, {stdio: [process.stdin, process.stdout, process.stderr]})
}



getIndex()