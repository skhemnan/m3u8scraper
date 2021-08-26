const pup = require("puppeteer");
const axios = require("axios");
var url = process.argv[2];

const getSlug = async (search) => {
	process.stdout.write("=")
	try {
		const res = await axios({method: 'get', url: `http://lookmovie.io/api/v1/movies/search/?q=${search}`})
		process.stdout.write("=")
		return res.data.result[0].slug
	} catch(e){
		console.log("> Error, couldn't find that movie! Please refine your search")
		process.exit()
	}
}

const getMaster = async () => {
	process.stdout.write("=")
	try {
    const browser = await pup.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
		const page = await browser.newPage();

		await page.setRequestInterception(true)
		let slug = await getSlug(url)
		let openUrl = `http://lookmovie.io/movies/view/${slug}`
		let reqUrl = ''

		page.on('request', req => {
			if(req.url().includes('.m3u8')){
				process.stdout.write("=")
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
	process.stdout.write("=")
	let finalUrl = ''
	let foundMaster = await getMaster()
	let res = await axios({method: 'get', url: foundMaster})
	finalUrl = res.data['480p']

	console.log(">", finalUrl)
}

getIndex()