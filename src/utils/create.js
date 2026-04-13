import puppeteer, { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';


let Browser = null;
let bowserTimeOutValue = null;


const BROWSER_TIMEOUT = 6000;


async function launchBrowser() {
    Browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });


    bowserTimeOutValue = setTimeout(async () => {
        if (Browser) {
            await Browser.close();
            Browser = null;
        }
    }, BROWSER_TIMEOUT);
}


async function closeBrowser() {
    if (Browser) {
        await Browser.close();
        Browser = null;
    }
    if (bowserTimeOutValue) {
        clearTimeout(bowserTimeOutValue);
        bowserTimeOutValue = null;
    }
}


export async function exportPdf(htmlTemplate, fileName, pdfHeader = '') {
    try {
        if (!Browser?.connected || !bowserTimeOutValue) {
            await launchBrowser();
        } else {
            bowserTimeOutValue.refresh();
        }


        if (!/\.pdf$/i.test(fileName)) {
            throw new Error(`Invalid filename, only allow the filename with .pdf`);
        }


        const filePath = `./uploads/${fileName}`;
        const page = await Browser.newPage();


        const options = {
            format: 'A4',
            margin: {
                top: '.27in',
                right: '.25in',
                bottom: '.5in',
                left: '.25in'
            },
            path: filePath,
            scale: 1.2,
            printBackground: true,
        };


        await page.setContent(htmlTemplate, { waitUntil: 'load' });


        await page.pdf(options);
        await page.close();


        return { filePath, fileName };
    } catch (error) {
        await closeBrowser();
        throw error;
    }
}