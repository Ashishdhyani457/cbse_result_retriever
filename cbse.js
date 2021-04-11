const pup=require("puppeteer");
let studentdata=require("./cbsedata");
let fs = require('fs');
let finaldata=[];
let studentcounted=0;
async function main(){
    let browser=await pup.launch({
        headless : false,
        defaultViewport : false,
        args: ["--start-maximized"]
    });
    let resulturl="https://cbseresults.nic.in/class12/Class12th20.htm";
    for(let i=0;i<studentdata.length;i++){
        await getresult(i,resulturl,studentdata[i],await browser.newPage(),studentdata.length);
    }
    browser.close();
}
async function getresult(i,url,data,tab,totalstudents){
    await tab.goto(url);
    await tab.waitForSelector("input[name='regno']",{visible: true});
await tab.type("input[name='regno']",data["Roll number"]);
await tab.type("input[name='sch']",data["School no"]);
await tab.type("input[name='cno']",data["Center number"]);
await tab.type("input[name='admid']",data["Admit ID"]);
await tab.click("input[type='submit']");
let studentname=data["Student"];
//takes screenshot of result
await tab.screenshot({path: `./ResultScreenshots/${studentname}.jpeg`});

await tab.waitForSelector("table[border='1']");
let table=await tab.$("table[border='1']");
let rows = await table.$$("tbody tr");
let rdata=[];
//storing data from table.
 
   rdata.push({"Student Name":studentname});
for(let row of rows) {
    let columns = await row.$$("td");
    if(columns.length==6){
        let tempData = {};
        for(let k = 0; k < columns.length; k++) {
            let text=await tab.evaluate(function(ele){
                return ele.textContent;
    },columns[k]);
            tempData[k]=text;
        }

       rdata.push(tempData);
         
    }
   
}

finaldata[i]=rdata;
await tab.close();
        studentcounted += 1;
        if(studentcounted == totalstudents) {
            fs.writeFileSync("Result.json", JSON.stringify(finaldata));
           
        }

}
main();