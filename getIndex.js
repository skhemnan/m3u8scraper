const pup = require("puppeteer");
var url = process.argv[2];


async function getIndexURL() {
  try{
    const browser = await pup.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
		const page = await browser.newPage();
		console.log(url);
		await page.goto(url,{waitUntil: 'load',timeout: 0});
		const indexURL = await page.evaluate(() => document.getElementsByTagName("a")[0]);
		console.log(indexURL);
		await browser.close();
	} catch(e){
    console.log(e)
	}
}

getIndexURL();
