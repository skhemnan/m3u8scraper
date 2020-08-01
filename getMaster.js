const pup = require("puppeteer");
var url = process.argv[2];


async function runScrape() {
  try{
    const browser = await pup.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
		const page = await browser.newPage();

	  await page.setRequestInterception(true);
    page.on("request",interceptedRequest => {
      let regex = /\.m3u8$/;
			let req = interceptedRequest.url();
			let a = req.split('/');
			let matches = regex.test(a);
			if(matches){
			 console.log("Found URL!!!")
			 console.log(req)
			}
			interceptedRequest.continue();
		})
		console.log("Loading site...");
		await page.goto(url,{waitUntil:'load',timeout: 0});
	  await page.waitForSelector('.thumbnail-play__btn-big.thumbnail-play__btn-big--emulate-vjs');
		console.log("Site loaded! Clicking play button...");
		await page.evaluate(() => document.querySelector('.thumbnail-play__btn-big.thumbnail-play__btn-big--emulate-vjs').click());
		console.log("Button Clicked!");
		setTimeout(async () => {await browser.close();},10000)	
		} catch(error) {
		console.log(error)
	}
 }

runScrape();
