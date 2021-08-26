const pup = require("puppeteer");
const axios = require("axios");
const { spawn } = require('child_process');
var url = process.argv[2];

let title = ''

const getSlug = async (search) => {
	process.stdout.write(`Searching for ${url} =`)
	try {
		const res = await axios({method: 'get', url: `http://lookmovie.io/api/v1/movies/search/?q=${search}`})
		title = res.data.result[0].title
		return res.data.result[0].slug
	} catch(e){
		console.log("> Error, couldn't find that movie! Please refine your search")
		process.exit()
	}
}

const getMaster = async () => {
	process.stdout.write('=')
	try {
    const browser = await pup.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
		const page = await browser.newPage();

		await page.setRequestInterception(true)
		let slug = await getSlug(url)
		let openUrl = `http://lookmovie.io/movies/view/${slug}`
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
	let movieObj = {title: title, url: res.data['480p']}
	console.log(`> Downloading ${movieObj.title}`)

	downloadFile(movieObj)

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


getIndex()