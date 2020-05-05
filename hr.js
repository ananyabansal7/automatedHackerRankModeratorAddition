let fs = require("fs");
let path = require("path")
require('chromedriver');
// require('geckodriver'); 
let swd = require('selenium-webdriver');

let bldr = new swd.Builder();
// let driver = bldr.forBrowser('chrome').build();
let driver = bldr.forBrowser('chrome').build();

let cFile = process.argv[2];
let userToAdd = process.argv[3];
//node hr.js credentials.json user1

(async function () {
    try {
        await driver.manage().setTimeouts({
            implicit: 10000,
            pageLoad: 10000
        });
        let contents = await fs.promises.readFile(cFile, 'utf-8');
        let obj = JSON.parse(contents);
        let user = obj.user;
        let pwd = obj.pwd;
        let url = obj.url;

        await driver.get(url);
        let uel = await driver.findElement(swd.By.css('#input-1')) // username element
        let pel = await driver.findElement(swd.By.css('#input-2')) //password element

        await uel.sendKeys(user)
        await pel.sendKeys(pwd)

        let btnLogin = await driver.findElement(swd.By.css('.auth-button')) // username element
        await btnLogin.click()


        let btnAdmin = await driver.findElement(swd.By.css('a[data-analytics=NavBarProfileDropDownAdministration]'))
        let adminUrl = await btnAdmin.getAttribute('href')
        await driver.get(adminUrl)

        let manageTabs = await driver.findElements(swd.By.css('ul.nav-tabs li'))
        await manageTabs[1].click()
        let curl = await driver.getCurrentUrl()
        console.log(curl)
        let qidx = 0
        let questionElement = await getQuestionElement(curl, qidx);

        while (questionElement != undefined) {
            await handleQuestion(questionElement)

            qidx++;
            questionElement = await getQuestionElement(curl, qidx);
        }
    } catch (err) {
        console.log(err);
    }
})();


async function getQuestionElement(curl, qidx) {
    await driver.get(curl)
    let pidx = parseInt(qidx / 10);
    qidx = qidx % 10;
    console.log(qidx +" "+pidx)

    let paginationBtns = await driver.findElements(swd.By.css('.pagination li'))
    let nextPageBtn = paginationBtns[paginationBtns.length - 2]


    let classOnNextPageBtn = await nextPageBtn.getAttribute('class')
    for (let i = 0; i < pidx; i++) {
        if(classOnNextPageBtn !== 'disabled'){
        await nextPageBtn.click()
        paginationBtns = await driver.findElements(swd.By.css('.pagination li'))
        nextPageBtn = paginationBtns[paginationBtns.length - 2]
        }else{
            return undefined
        }
    }
    let questionElements = await driver.findElements(swd.By.css('.backbone.block-center')) //max =10 (0,9)
    if (qidx < questionElements.length) {
        return questionElements[qidx];
    } else {
        return undefined;
    }

    
}

async function handleQuestion(questionElement) {
    let qurl = await questionElement.getAttribute('href')
    console.log(qurl)
    await questionElement.click();
    // sleepSync(3000);    // solution 1

    // let nametext = await driver.findElement(swd.By.css('#name'))   // solution 2
    // await nametext.sendKeys('kuchbhi') // solution 2

    await driver.wait(swd.until.elementLocated(swd.By.css('span.tag'))) //solution 3

    // waitUntilLoaderDisappears()
    let moderatorTab = await driver.findElement(swd.By.css('li[data-tab=moderators]'))
    await moderatorTab.click()




    //solution 2
    // let cancelBtn = await driver.findElement(swd.By.css('#cancelBtn')) // solution 2
    //     await cancelBtn.click() // solution 2
    // try{
    //     let confirmBox = await driver.findElement(swd.By.css('#confirm-modal'))

    //     let discadBtn = await confirmBox.findElement(swd.By.css('#cancelBtn'))
    //     await discardBtn.click()
    //     console.log(" popup discarded")

    // }catch(err){
    //     console.log("no pop to discard")
    // }

    // try{
    //     let cancelBtn = await driver.findElement(swd.By.css('#cancelBtn'))
    //     await cancelBtn.click()

    // }catch(err){
    //     console.log("no pop up")
    // }


    let moderatorTextBox = await driver.findElement(swd.By.css('#moderator'))
    await moderatorTextBox.sendKeys(userToAdd)

    await moderatorTextBox.sendKeys(swd.Key.ENTER)
    let btnsave = await driver.findElement(swd.By.css('.save-challenge'))
    await btnsave.click()


    // sleepsync(1000)

}

async function waitUntilLoaderDisappears(){
    let loader = await driver.findElement(swd.By.css('#ajax-msg'))
    await driver.wait(swd.until.elementIsNotVisible(loader))
}
function sleepSync(duration){
    let curr = Date.now()
    let limit = curr + duration
    while(curr<limit){
        curr = Date.now();
    }
}