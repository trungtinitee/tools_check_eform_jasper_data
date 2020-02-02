//main program
//get modules
const fs = require("fs");
const path = require('path');
const pdf = require('pdf-parse');
const sleep = require("sleep");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const clipboardy = require("clipboardy");

//get data to starting program
let infoTest;
try {
  let rawDataInfo = fs.readFileSync("./firstDataSources.json");
  infoTest = JSON.parse(rawDataInfo);
} catch (error) {
  console.log("Not found firstDataSources.json file!");
  console.log("Update this file and run again");
  sleep.sleep(5);
  process.exit();
}
//..........................................................................................
let eformTest;
try {
  var dir =
    "./data/eformData/" +
    infoTest.groupName +
    "/" +
    infoTest.eformName +
    ".json";
  let rawDataEform = fs.readFileSync(dir);
  eformTest = JSON.parse(rawDataEform);
} catch (error) {
  console.log("Not found " + dir);
  console.log("Update this file and run again");
  sleep.sleep(5);
  process.exit();
}
//...........................................................................................
var jasperTest, rawDataJasper;
try {
  var dir =
    "./data/jasperData/" +
    infoTest.groupName +
    "/" +
    infoTest.eformName +
    ".txt";
  rawDataJasper = fs.readFileSync(dir);
} catch (error) {
  console.log("Not found " + dir);
  console.log("Update this file and run again");
  sleep.sleep(5);
  process.exit();
}
jasperTest = rawDataJasper.toString();
//Console.log(jasperTest);

//console.log(infoTest);
//console.log(eformTest);
//console.log(jasperTest);

// process data sources
var testPrintPdf = false;
var totalSection = eformTest.eform.template.sections.length;
//console.log("--> Total section: " + totalSection);
// ................. search every thing in eform json data....................//

function searchEnableButtom(index) {
  var dir = eformTest.eform.template.sections[index];
  //console.log(dir);
  if (dir.viewType === "dynamic") {
    return "enable_" + index;
  } else return null;
} // search id for Enable Buttom

function searchOpenSection(index) {
  var dir = eformTest.eform.template.sections[index];
  //console.log(dir);
  if (dir.defaultOpenCloseSection === "NO") {
    return "//*[@class='fa fa-plus']";
  } else return null;
} // search xpath for Open section

function loopSearchSomethingInEform(thing, dir, whatGet, parentObject) {
  var arrTemp = [];
  var temp = 0;
  for (var chil in parentObject) {
    //console.log(parentObject[chil][dir]);
    temp++;
    //console.log("dir", parentObject[chil][dir]);
    if (
      parentObject[chil][dir] !== undefined &&
      parentObject[chil][dir] !== ""
    ) {
      if (parentObject[chil][dir] === thing) {
        var item = parentObject[chil][whatGet];
        //console.log("item get", item);
        if (item === "" || item === undefined || item === null) {
          item = parentObject[chil]["ref"];
        }
        arrTemp.push(item);
      }
    } else {
      console.log("--> Can not found at" + temp + "in parentObject");
      sleep.sleep(30);
    }
  }
  return arrTemp;
} // return array of whatGet needed in parentObject, if dont find return id that field

function loopSearchSomethingInJasper(whatFieldname) {
  var valueReturnAfterCompare = false;
  var numberValueFound = 0;
  var look = 0;
  //console.log(textFieldExpression.length);
  while (look < jasperTest.length) {
    var positionOfWhatFieldName = jasperTest.indexOf(
      '"' + whatFieldname + '"',
      look
    );
    //console.log(positionOfWhatFieldName);
    if (positionOfWhatFieldName !== -1) {
      numberValueFound = numberValueFound + 1;
      valueReturnAfterCompare = true;
      look = positionOfWhatFieldName + whatFieldname.length;
      //console.log(look);
    } else {
      break;
    }
  }
  return numberValueFound;
} // return quatity of whatFieldName searched in jasper

function loopSearchSomethingInJasperonlyTextField(whatFieldname) {
  var valueReturnAfterCompare = false;
  var numberValueFound = 0;
  var look = 0;
  function checkQuantityofFieldname(start) {
    var count = 0,
      look = 0;
    var stringCut = jasperTest.substr(start - 150, 300);

    while (look < stringCut.length) {
      var posFind = stringCut.indexOf('"' + whatFieldname + '"', look);
      if (posFind !== -1) {
        count = count + 1;
        //console.log(count);
        look = posFind + whatFieldname.length;
      } else break;
    }
    return count;
  }
  //console.log(textFieldExpression.length);
  while (look < jasperTest.length) {
    var positionOfWhatFieldName = jasperTest.indexOf(
      '"' + whatFieldname + '"',
      look
    );
    //console.log(positionOfWhatFieldName);

    if (positionOfWhatFieldName !== -1) {
      if (checkQuantityofFieldname(positionOfWhatFieldName) === 2) {
        numberValueFound = numberValueFound + 1;
        valueReturnAfterCompare = true;
      }
      look = positionOfWhatFieldName + whatFieldname.length;
      //console.log(checkQuantityofFieldname(positionOfWhatFieldName));
    } else {
      break;
    }
  }
  return numberValueFound;
} // return quatity of whatFieldName searched in jasper (only use for text field)

function loopSearchBothNameandValueInJasper(whatFieldname, valueofFieldName) {
  var valueReturnAfterCompare = false;
  var quantityFieldNameFound = 0,
    quantityValueFound = 0;
  var look = 0;
  //console.log(printWhenExpression);
  while (look < jasperTest.length) {
    var positionOfWhatFieldName = jasperTest.indexOf(
      '"' + whatFieldname + '"',
      look
    );
    //console.log("----->",positionOfWhatFieldName);
    var checkPrintWhenExpressionforSection = true;
    if (positionOfWhatFieldName !== -1) {
      var tempString = jasperTest.substr(positionOfWhatFieldName, 100);
      var searchPosOfEXP = tempString.indexOf("equals", 0);
      //console.log("----->",tempString);
      if (searchPosOfEXP !== -1) {
        checkPrintWhenExpressionforSection = false;
      }
    }

    //console.log("this string check for EXP", checkPrintWhenExpression);

    //console.log(positionOfWhatFieldName);
    if (positionOfWhatFieldName !== -1) {
      if (checkPrintWhenExpressionforSection === false) {
        quantityFieldNameFound = quantityFieldNameFound + 1;
        look = positionOfWhatFieldName + whatFieldname.length;
        var newStringtoSearchValue = jasperTest.substr(look, 100);
        var positionOfValueOfFieldName = newStringtoSearchValue.indexOf(
          '"' + valueofFieldName + '"',
          0
        );
        if (positionOfValueOfFieldName !== -1) {
          quantityValueFound = quantityValueFound + 1;
        }
        valueReturnAfterCompare = true;
      } else {
        look = positionOfWhatFieldName + whatFieldname.length + 20;
      }
      //console.log(look);
    }
    else {
      break;
    }
  }
  return [quantityFieldNameFound, quantityValueFound];
} // search quantity of Field Name and Value and return quantity of them type array;

// create a string all lable in eform template

function createAllLableToString() {
  var tempString = "";
  var arrAllLableInEform = loopSearchSomethingInEform("eform_input_check_label",
    "type",
    "label",
    eformTest.eform.fieldsByRef);

  //action join elements of arr to a long string
  for (var i = 0; i < arrAllLableInEform.length; i++) {
    tempString = tempString + " " + arrAllLableInEform[i];
  }
  return tempString;
}





//..................................................................................................................
console.log('\x1b[36m%s\x1b[0m', "************ CODE BY TRUNG TIN *****v1.0*******");
console.log("- This tools supports check for eform and jasper data.");
console.log("- Some field will be checked such as: textbox, radio, checkbox, signature of patient and doctor.");
console.log("******************************************//**************************************************** \n \n");
//sleep.sleep(1);
//...................................................................................................................
console.log("\x1b[36m%s\x1b[0m", ">> Starting compare between eform and jasper data... \n");

{
  console.log(
    '\x1b[31m', ">>List text fields error:"
  );
  console.log(
    "*** Noted: \n      + id-> not see id in eform; \n      + field name-> not see field name in jasper\n"
  );
  var arrListFieldNameTextField = loopSearchSomethingInEform(
    "eform_input_text",
    "type",
    "name",
    eformTest.eform.fieldsByRef
  );
  //console.log(arrListFieldNameTextField);
  for (var i = 0; i < arrListFieldNameTextField.length; i++) {
    var numberValueFound = loopSearchSomethingInJasperonlyTextField(
      arrListFieldNameTextField[i]
    ); //search with jasper file
    //console.log("number value found " + numberValueFound);
    //console.log("numberseach", numberValueFound + "|" + arrListFieldNameTextField[i]);
    if (numberValueFound !== 2) {
      console.log("--> \"" + arrListFieldNameTextField[i] + "\" | " + numberValueFound + "\n");
    }
  } // search bug for text field
  //sleep.sleep(1);
  //...................................................................................................................
  var arrListNameRadioField = loopSearchSomethingInEform(
    "eform_input_check_radio",
    "type",
    "name",
    eformTest.eform.fieldsByRef
  );
  var arrListValueRadioCompare = loopSearchSomethingInEform(
    "eform_input_check_radio",
    "type",
    "value",
    eformTest.eform.fieldsByRef
  );
  //console.log(arrListNameRadioField);
  //console.log(arrListValueRadioCompare);
  console.log(
    '\x1b[31m', "\n>>List radio fields error:"
  );
  console.log(
    "*** Noted: \n      + id-> not see id in eform; \n      + field name-> not see field name in jasper \n"
  );
  for (var i = 0; i < arrListNameRadioField.length; i++) {
    var arrQuantityofThem = loopSearchBothNameandValueInJasper(
      arrListNameRadioField[i],
      arrListValueRadioCompare[i]
    );
    //console.log("++++++", arrQuantityofThem);
    function seachQuantityofSomething(arr, input) {
      var count = 0;
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] === input) {
          count++;
        }
      }
      return count;
    }
    function checkIsTextField(fieldName) {
      if (loopSearchSomethingInJasper(fieldName) === 2) {
        return true;
      } else {
        return false;
      }
    }

    var checkFieldIdofName = arrListNameRadioField[i].indexOf("field_", 0);
    if (checkFieldIdofName !== -1) {
      console.log("--> Not Found field name: " + arrListNameRadioField[i]);
    }

    var checkFieldIdofValue = arrListValueRadioCompare[i].indexOf("field_", 0);
    if (checkFieldIdofValue !== -1) {
      console.log("--> Not Found field name: " + arrListValueRadioCompare[i]);
    }

    if (checkIsTextField(arrListNameRadioField[i]) === false) {
      var checkQuantityFieldName = seachQuantityofSomething(
        arrListNameRadioField,
        arrListNameRadioField[i]
      );
      //console.log("-----", checkQuantityFieldName + "|" + arrQuantityofThem[0]);
      if (
        checkQuantityFieldName !== arrQuantityofThem[0] && //0 = quantity of field name, 1 = quantity of value
        checkFieldIdofName === -1
      ) {
        console.log("--> case 1: \"" + arrListNameRadioField[i] + "\" | " + arrQuantityofThem[0]);
      }

      //console.log("check1",arrListNameRadioField[i]);
      //console.log("check2",arrListValueRadioCompare[i]);

      //console.log("check", arrQuantityofThem[1]);
      //var checkQuantityValeField = seachQuantityofSomething(arrListValueRadioCompare, arrListValueRadioCompare[i]);
      if (1 !== arrQuantityofThem[1] && checkFieldIdofValue === -1) {
        console.log("--> case 2: \"" + arrListValueRadioCompare[i] + "\" |> Which field name: " + arrListNameRadioField[i] + "\n");
      }
    }
    //console.log(arrQuantityofThem + " || " +arrListNameRadioField[i] + " || " + arrListValueRadioCompare[i]);
  } //search bug for radio
  //sleep.sleep(1);
  //...................................................................................................................
  var arrListNameCheckboxField = loopSearchSomethingInEform(
    "eform_input_check_checkbox",
    "type",
    "name",
    eformTest.eform.fieldsByRef
  );
  var arrListValueCheckboxCompare = loopSearchSomethingInEform(
    "eform_input_check_checkbox",
    "type",
    "value",
    eformTest.eform.fieldsByRef
  );

  //console.log(arrListNameCheckboxField);
  //console.log(arrListValueCheckboxCompare);
  console.log(
    '\x1b[31m', "\n>>List checkbox fields error:"
  );
  console.log(
    "*** Noted: \n      + id-> not see id in eform; \n      + field name-> not see field name in jasper \n"
  );
  for (var i = 0; i < arrListNameCheckboxField.length; i++) {
    var arrQuantityofThem = loopSearchBothNameandValueInJasper(
      arrListNameCheckboxField[i],
      arrListValueCheckboxCompare[i]
    );
    function seachQuantityofSomething(arr, input) {
      var count = 0;
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] === input) {
          count++;
        }
      }
      return count;
    }

    var checkFieldIdofName = arrListNameCheckboxField[i].indexOf("field_", 0);
    if (checkFieldIdofName !== -1) {
      console.log("--> Not Found field name: " + arrListNameCheckboxField[i]);
    }

    var checkFieldIdofValue = arrListValueCheckboxCompare[i].indexOf(
      "field_",
      0
    );
    if (checkFieldIdofValue !== -1) {
      console.log("--> Not Found field name: " + arrListValueCheckboxCompare[i]);
    }

    var checkQuantityFieldName = seachQuantityofSomething(
      arrListNameCheckboxField,
      arrListNameCheckboxField[i]
    );
    if (
      ((checkQuantityFieldName !== 1 && arrQuantityofThem[0] !== 1) ||
        (checkQuantityFieldName === 1 && arrQuantityofThem[0] !== 1) ||
        (checkQuantityFieldName !== 1 && arrQuantityofThem[0] === 1)) &&
      checkFieldIdofName === -1
    ) {
      console.log("--> case 1: \"" + arrListNameCheckboxField[i] + "\" | " + arrQuantityofThem[0]);
    }

    //var checkQuantityValeField = seachQuantityofSomething(arrListValueRadioCompare, arrListValueRadioCompare[i]);


    if (1 !== arrQuantityofThem[1] && checkFieldIdofValue === -1) {
      //console.log(arrQuantityofThem[1]);
      console.log("--> case 2: \"" + arrListValueCheckboxCompare[i] + "\" |> Field name error: " + arrListNameCheckboxField[i] + "\n");
    }

    if (arrListValueCheckboxCompare[i] !== "yes") {
      console.log(
        "> Value not correct at field name: " + arrListNameCheckboxField[i]
      );
    }
    //console.log(arrQuantityofThem);
    //console.log(arrQuantityofThem + " || " +arrListNameRadioField[i] + " || " + arrListValueRadioCompare[i]);
  } // search bug for checkbox
  //sleep.sleep(1);
  //....................................................................................................................................

  console.log(
    '\x1b[31m', ">>List signature error:"
  );
  console.log(
    "*** Noted: \n      + id-> not see id in eform; \n      + field name-> not see field name in jasper\n"
  );
  var arrListFieldNameSignatureDoctor = loopSearchSomethingInEform(
    "eform_input_image_doctor",
    "type",
    "name",
    eformTest.eform.fieldsByRef
  );
  var arrListFieldNameSignaturePatient = loopSearchSomethingInEform(
    "eform_input_signature",
    "type",
    "name",
    eformTest.eform.fieldsByRef
  );
  //console.log(arrListFieldNameSignatureDoctor);

  for (var i = 0; i < arrListFieldNameSignatureDoctor.length; i++) {
    var numberValueFound = loopSearchSomethingInJasper(
      arrListFieldNameSignatureDoctor[i]
    ); //search with jasper file
    //console.log(numberValueFound);
    if (numberValueFound !== 1) {
      console.log("--> " + arrListFieldNameSignatureDoctor[i] + "\n");
    }
  } // search bug for doctor signature

  for (var i = 0; i < arrListFieldNameSignaturePatient.length; i++) {
    var numberValueFound = loopSearchSomethingInJasper(
      arrListFieldNameSignaturePatient[i]
    ); //search with jasper file
    //console.log(numberValueFound);
    if (numberValueFound !== 1) {
      console.log("--> " + arrListFieldNameSignaturePatient[i] + "\n");
    }
  } // search bug for patient signature
}




//...................................----------------------------------------------------..............................




// check jasper file
//....................................................................................
if (infoTest.checkPDF === 1){

//control chrome make something
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const chromePrefs = { 'download.default_directory': infoTest.directToFolderPDFDownload }
const chromeOptions = new chrome.Options().setUserPreferences(chromePrefs)
function createNameForPDFFile() {
  var treatmentForPatient = infoTest.patientName;
  var posSpace = treatmentForPatient.lastIndexOf(" ");

  treatmentForPatient = treatmentForPatient.substr(0, posSpace) + "_" + treatmentForPatient.substr(posSpace + 1, treatmentForPatient.length - posSpace);
  var treatmentForNameForm = infoTest.eformName;
  //console.log(namePDF);
  while ((treatmentForNameForm.indexOf("/", 0) !== -1)) {
    treatmentForNameForm = treatmentForNameForm.replace("/", "_");
  }
  if (infoTest.operatingSystem === "mac") {
    return "/" + treatmentForPatient + "_" + treatmentForNameForm + ".pdf";
  } else {
    return "\\" + treatmentForPatient + "_" + treatmentForNameForm + ".pdf";
  }
}


if (infoTest.operatingSystem === "mac") {
  chrome.setDefaultService(
    new chrome.ServiceBuilder("./WebDriver/bin/chromedriver").build()
  );
} else {
  chrome.setDefaultService(
    new chrome.ServiceBuilder("./WebDriver/bin/chromedriver.exe").build()
  );
}


(async function rootProgram() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  await driver.get(infoTest.eformLink);
  await driver.wait(until.elementLocated(By.id("close_Button")), 30000);
  //delete all file before download action
  fs.readdir(infoTest.directToFolderPDFDownload, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(infoTest.directToFolderPDFDownload, file), err => {
        if (err) throw err;
      });
    }
  });

  //download action
  await (await driver.findElement(By.id("download_2"))).click();
  await driver.wait(
    async () => (await driver.getAllWindowHandles()).length === 2,
    30000
  );

  sleep.sleep(10);

  //quit chrome after download sucessed!!!
  await driver.quit();

  //read pdf file
  let dataBuffer = fs.readFileSync(infoTest.directToFolderPDFDownload + createNameForPDFFile());  
  pdf(dataBuffer).then(function (data) {
    var dataTextGetFromPDFFile = data.text;
    //console.log(dataTextGetFromPDFFile);
    var stringOfEformTemplate = createAllLableToString();
    var look = 0;
    var posOfSpace = stringOfEformTemplate.indexOf(" ", look);
    var arrChecked = [];

    // cut long string covert to each word.
    while (posOfSpace !== -1) {
      var tempWordCheck = "";
      if (posOfSpace === look) {
        look = look + 1;
        posOfSpace = stringOfEformTemplate.indexOf(" ", look);
      } else {
        tempWordCheck = stringOfEformTemplate.substr(look, posOfSpace - look);
        look = posOfSpace + 1;
        posOfSpace = stringOfEformTemplate.indexOf(" ", look);
      }

      //looking something in jasper and eform
      function searchInJasperPrint(textInput) {
        var textSearch = textInput;
        if ((textSearch.indexOf("field_", 0) !== -1)) {
          return true;
        } else {

          var posTextInput = dataTextGetFromPDFFile.indexOf(textSearch, 0);
          var exitLoop = false;          
         
          //loop to search in array list???
          while (exitLoop === false && posTextInput !== -1) {

            var hasInArr = false;
            for (var i = 0; i < arrChecked.length; i++) {
              if (posTextInput === arrChecked[i]) {
                hasInArr = true;
              }
            }

            //console.log(hasInArr);
            // if true create new position for seach text, else push and exit loop while
            if (hasInArr === true) {
              posTextInput = dataTextGetFromPDFFile.indexOf(textSearch, posTextInput + textSearch.length);
              
              //console.log(">>>>", posTextInput);
            } else {
              arrChecked.push(posTextInput);
              exitLoop = true;
            }
          }

          if (posTextInput !== -1) {
            return true;
          } else {
            return false;
          }
        }
      }

      //console.log("haaaaaaaaaaa", tempWordCheck);
      if (searchInJasperPrint(tempWordCheck) === false) {
        console.log("This word miss in jasper file pls check manual again: ", tempWordCheck);
      }

    }
    //clipboardy.writeSync(arrChecked.toString());
    // console.log(arrChecked);
    // PDF text
    //console.log(stringOfEformTemplate);
    //console.log("hello", searchInJasperPrint("practice,"));
  });
})();
}



/*
*/
//............................................................................................................
/*
{
  console.log(".>..>>..>>>..Loading................");
  //sleep.sleep(5); // sleep 5s to process number
  console.log(".>..>>..>>>..Completed..>>>...>>>>>>");

  //...................................................................................................

  //......................................................................................................................................
  //control chrome make something
  const { Builder, By, Key, until } = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  var idMainWidow, ideformWindow, idConsultation;

  if (infoTest.operatingSystem === "mac") {
    chrome.setDefaultService(
      new chrome.ServiceBuilder("./WebDriver/bin/chromedriver").build()
    );
  } else {
    chrome.setDefaultService(
      new chrome.ServiceBuilder("./WebDriver/bin/chromedriver.exe").build()
    );
  }
  (async function rootProgram() {
    let driver = await new Builder().forBrowser("chrome").build();

    await driver.get("https://trungtinitee.github.io/tool_check_eform_jasper/");
    await driver.wait(until.elementLocated(By.id("root_Program")), 30000);

    console.log("ok");

    sleep.sleep(500);
    try {
      console.log(">> Open home page...");

      await driver.get("https://test.redisys.com.au/");
      await driver
        .findElement(
          By.xpath("//*[@placeholder='Username' and @class='ant-input'] ")
        )
        .sendKeys(infoTest.userName);
      await driver
        .findElement(
          By.xpath("//*[@placeholder='Password' and @class='ant-input'] ")
        )
        .sendKeys(infoTest.password + Key.ENTER);
    } finally {
      console.log("--> OK");
    }

    try {
      console.log(">> Open patients number...");

      await driver.wait(
        until.elementLocated(By.xpath("//*[@alt='REDIMED']")),
        30000
      );

      if (infoTest.numberOfPatient === "") {
        console.log(
          "Cant see any id of patient, program will choose automation!//ID: 43782"
        );
        await driver.get("https://test.redisys.com.au/patient/43782");
      } else {
        await driver.get(
          "https://test.redisys.com.au/Patient/" + infoTest.numberOfPatient
        );
      }
    } finally {
      console.log("--> OK");
    }

    //...................................................................................................

    // GET ALL INFORMATION OF PATIENT INTO ONE OBJECT TO COMPARE AFTER OPEN EFORM
    {
      var objectNewInfoPatient = {
        Address1: null,
        Address2: null,
        AccountHolderType: null,
        AccountHolder: null,
        Country: null,
        DOB: null,
        DateAppointment: null,
        Email1: null,
        Email2: null,
        FaxNumber: null,
        POBoxNo: null,
        FirstName: null,
        Gender: null,
        HomePhoneNumber: null,
        HealthCareProvider: null,
        LastName: null,
        MiddleName: null,
        Occupation: null,
        PhoneNumber: null,
        Postcode: null,
        State: null,
        Suburb: null,
        Title: null,
        WorkPhoneNumber: null,
        RaceEthnicityId: null,
        RaceEthnicity: null,
        MedicareExpiryDate: null,
        MedicareNumber: null,
        MedicareReferenceNumber: null,
        DVANumber: null,
        DVACardColour: null,
        PensionNumber: null,
        PensionExpiryDate: null,
        DVADisability: null,
        PrivateHealthFund: null,
        MembershipNumber: null,
        PHFRefNo: null,
        PatientKinFirstName: null,
        PatientKinHomePhoneNumber: null,
        PatientKinLastName: null,
        PatientKinMiddleName: null,
        PatientKinMobilePhoneNumber: null,
        PatientKinRelationship: null,
        PatientKinWorkPhoneNumber: null,
        ID: null,
        UID: null,
        CaseID: null,
        PatientID: null,
        OrganisationSite: null
      };
      try {
        console.log(">> Starting get infomation of Patient...");

        await driver.wait(
          until.elementLocated(By.xpath("//*[@alt='REDIMED']")),
          30000
        );
        sleep.sleep(2);

        try {
          {
            var stitle;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(1) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              stitle = temp;
            });
            await driver.wait(async () => stitle !== undefined, 30000);
          }
        } catch (error) {
          stitle = "";
        } //Title

        {
          var sFirstName;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(2) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sFirstName = temp;
          });
          await driver.wait(async () => sFirstName !== undefined, 30000);
        } //First name

        {
          var sMidName;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(3) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMidName = temp;
          });
          await driver.wait(async () => sMidName !== undefined, 30000);
        } //Mid name

        {
          var sSureName;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(4) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sSureName = temp;
          });
          await driver.wait(async () => sSureName !== undefined, 30000);
        } //Sure name

        {
          var sDOB;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(5) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > span > div > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sDOB = temp;
          });
          await driver.wait(async () => sDOB !== undefined, 30000);
        } //Dob

        try {
          {
            var sGender;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(6) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sGender = temp;
            });
            await driver.wait(async () => sGender !== undefined, 30000);
          }
        } catch (error) {
          sGender = "";
        } //Gender

        try {
          {
            var sRaceEthnicity;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(7) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sRaceEthnicity = temp;
            });
            await driver.wait(async () => sRaceEthnicity !== undefined, 30000);
          }
        } catch (error) {
          sRaceEthnicity = "";
        } //Race/Ethnicity

        {
          var sOccupation;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(8) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sOccupation = temp;
          });
          await driver.wait(async () => sOccupation !== undefined, 30000);
        } //Occupation

        try {
          {
            var sOrganisationSite;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div.ant-col.ant-col-md-18 > div:nth-child(9) > div > div:nth-child(1) > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-14 > div > span > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sOrganisationSite = temp;
            });
            await driver.wait(
              async () => sOrganisationSite !== undefined,
              30000
            );
          }
        } catch (error) {
          sOrganisationSite = "";
        } //Organisation Site
        {
          await driver
            .findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-bar.ant-tabs-top-bar.ant-tabs-large-bar > div > div > div > div > div:nth-child(1) > div:nth-child(2)"
              )
            )
            .click();
          await driver.wait(
            until.elementsLocated(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(1) > div > div > div.ant-col.ant-form-item-label.ant-col-xs-24.ant-col-sm-6 > label"
              )
            ),
            30000
          );
          sleep.sleep(2);
        } //move next page and wait element loaded.
        {
          var sEmail;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(1) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sEmail = temp;
          });
          await driver.wait(async () => sEmail !== undefined, 30000);
        } //Email

        {
          var sMobilePhone;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(2) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMobilePhone = temp;
          });
          await driver.wait(async () => sMobilePhone !== undefined, 30000);
        } //Mobile Phone

        {
          var sHomePhone;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(3) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sHomePhone = temp;
          });
          await driver.wait(async () => sHomePhone !== undefined, 30000);
        } //Home Phone

        {
          var sWorkPhone;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(4) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sWorkPhone = temp;
          });
          await driver.wait(async () => sWorkPhone !== undefined, 30000);
        } //Work Phone

        {
          var sAddress;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(5) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sAddress = temp;
          });
          await driver.wait(async () => sAddress !== undefined, 30000);
        } //Address

        {
          var sSuburb;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(6) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sSuburb = temp;
          });
          await driver.wait(async () => sSuburb !== undefined, 30000);
        } //Suburb

        {
          var sPostcode;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(7) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sPostcode = temp;
          });
          await driver.wait(async () => sPostcode !== undefined, 30000);
        } //Postcode

        try {
          {
            var sState;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(8) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sState = temp;
            });
            await driver.wait(async () => sState !== undefined, 30000);
          }
        } catch (error) {
          sState = "";
        } //State

        try {
          {
            var sCountry;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(9) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sCountry = temp;
            });
            await driver.wait(async () => sCountry !== undefined, 30000);
          }
        } catch (error) {
          sCountry = "";
        } //Country

        {
          var sPOBoxNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > form > fieldset > div > div > div:nth-child(10) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sPOBoxNo = temp;
          });
          await driver.wait(async () => sPOBoxNo !== undefined, 30000);
        } //PO Box No

        {
          await driver
            .findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-bar.ant-tabs-top-bar.ant-tabs-large-bar > div > div > div > div > div:nth-child(1) > div:nth-child(3)"
              )
            )
            .click();
          await driver.wait(
            until.elementsLocated(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(1) > div > div > div.ant-col.ant-form-item-label.ant-col-xs-24.ant-col-sm-6 > label"
              )
            ),
            30000
          );
          sleep.sleep(2);
        } //move next page and wait element loaded.

        {
          var sMedicareNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(1) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMedicareNo = temp;
          });
          await driver.wait(async () => sMedicareNo !== undefined, 30000);
        } //Medicare No

        {
          var sMedicareRefNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(2) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMedicareRefNo = temp;
          });
          await driver.wait(async () => sMedicareRefNo !== undefined, 30000);
        } //Medicare Ref No

        {
          var sMedicareExpiry;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(3) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > span > div > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMedicareExpiry = temp;
          });
          await driver.wait(async () => sMedicareExpiry !== undefined, 30000);
        } //Medicare Expiry

        try {
          {
            var sPrivateHealthFund;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(4) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sPrivateHealthFund = temp;
            });
            await driver.wait(
              async () => sPrivateHealthFund !== undefined,
              30000
            );
          }
        } catch (error) {
          sPrivateHealthFund = "";
        } //Private Health Fund

        {
          var sMembershipNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(5) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sMembershipNo = temp;
          });
          await driver.wait(async () => sMembershipNo !== undefined, 30000);
        } //Membership Number

        {
          var sPHFRefNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(6) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sPHFRefNo = temp;
          });
          await driver.wait(async () => sPHFRefNo !== undefined, 30000);
        } //PHF Ref No

        {
          var sDVANo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(7) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sDVANo = temp;
          });
          await driver.wait(async () => sDVANo !== undefined, 30000);
        } //DVA No

        try {
          {
            var sCardColor;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(8) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sCardColor = temp;
            });
            await driver.wait(async () => sCardColor !== undefined, 30000);
          }
        } catch (error) {
          sCardColor = "";
        } //Card Color

        {
          var sDVADisAbility;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(9) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sDVADisAbility = temp;
          });
          await driver.wait(async () => sDVADisAbility !== undefined, 30000);
        } //DVA Disability

        {
          var sPensionNo;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(10) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sPensionNo = temp;
          });
          await driver.wait(async () => sPensionNo !== undefined, 30000);
        } //Pension Number

        {
          var sPensionExpiry;
          var selectItem = await driver.findElement(
            By.css(
              "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(11) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > span > div > input"
            )
          );
          selectItem.getAttribute("value").then(function(temp) {
            sPensionExpiry = temp;
          });
          await driver.wait(async () => sPensionExpiry !== undefined, 30000);
        } //Pension Expiry

        try {
          {
            var sAccountHolderType;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(13) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sAccountHolderType = temp;
            });
            await driver.wait(
              async () => sAccountHolderType !== undefined,
              30000
            );
          }
        } catch (error) {
          sAccountHolderType = "";
        } //Account holder Type

        try {
          {
            var sAccountHolder;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.ant-spin-nested-loading > div > div > form > fieldset > div > div > div:nth-child(14) > div > div > div.ant-col.ant-form-item-control-wrapper.ant-col-xs-24.ant-col-sm-18 > div > span > div > div:nth-child(1) > div > div > div > div.ant-select-selection-selected-value"
              )
            );
            selectItem.getAttribute("title").then(function(temp) {
              sAccountHolder = temp;
            });
            await driver.wait(async () => sAccountHolder !== undefined, 30000);
          }
        } catch (error) {
          sAccountHolder = "";
        } //Account holder

        idMainWidow = await driver.getWindowHandle();
        console.log(idMainWidow);

        if (infoTest.eformLink === "") {
          console.log("Program will choose newest consultation for this eform");
          {
            await driver
              .findElement(
                By.css(
                  "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-bar.ant-tabs-top-bar.ant-tabs-large-bar > div > span.ant-tabs-tab-next.ant-tabs-tab-arrow-show"
                )
              )
              .click();
            sleep.sleep(1);

            await driver
              .findElement(
                By.css(
                  "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-bar.ant-tabs-top-bar.ant-tabs-large-bar > div > div > div > div > div:nth-child(1) > div:nth-child(8)"
                )
              )
              .click();
            await driver.wait(
              until.elementsLocated(
                By.css(
                  "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > div > div.ant-table-wrapper.table > div > div > div > div > div > table > tbody > tr:nth-child(1)"
                )
              ),
              30000
            );
            sleep.sleep(2);
          } //move next page and wait element loaded.

          {
            var sDateAppointment;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > div > div.ant-table-wrapper.table > div > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(1)"
              )
            );
            selectItem.getText().then(function(temp) {
              sDateAppointment = temp;
            });
            await driver.wait(
              async () => sDateAppointment !== undefined,
              30000
            );
          } //Date Appointment

          {
            var sHealthCareProvider;
            var selectItem = await driver.findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > div > div.ant-table-wrapper.table > div > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(6)"
              )
            );
            selectItem.getText().then(function(temp) {
              sHealthCareProvider = temp;
            });
            await driver.wait(
              async () => sHealthCareProvider !== undefined,
              30000
            );
          } //Health care provider
          await driver
            .findElement(
              By.css(
                "#root > div > section > section > main > div > div > div > div.theme_pageBody__3u0oc > div > div > div.ant-tabs-content.ant-tabs-content-no-animated.ant-tabs-top-content > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div.theme_tabBody__2xshL > div > div.ant-table-wrapper.table > div > div > div > div > div > table > tbody > tr:nth-child(1) > td.ant-table-row-cell-break-word > button"
              )
            )
            .click();

          //check again windows handle
          await driver.wait(
            async () => (await driver.getAllWindowHandles()).length === 2,
            30000
          );
          const getTempHandle = await driver.getAllWindowHandles();
          getTempHandle.forEach(async element => {
            if (element !== idMainWidow) {
              await driver.switchTo().window(element);
            }
          });
          idConsultation = await driver.getWindowHandle();
          console.log(idConsultation);
        } else {
          await driver.switchTo().newWindow("tab");
          await driver.wait(
            async () => (await driver.getAllWindowHandles()).length === 2,
            30000
          );
          await driver.get(infoTest.eformLink);
          ideformWindow = await driver.getWindowHandle();
          console.log(ideformWindow);
        }
      } finally {
        objectNewInfoPatient.Title = stitle;
        objectNewInfoPatient.FirstName = sFirstName;
        objectNewInfoPatient.MiddleName = sMidName;
        objectNewInfoPatient.LastName = sSureName;
        objectNewInfoPatient.DOB = sDOB;
        objectNewInfoPatient.Gender = sGender;
        objectNewInfoPatient.RaceEthnicity = sRaceEthnicity;
        objectNewInfoPatient.Occupation = sOccupation;
        objectNewInfoPatient.OrganisationSite = sOrganisationSite;
        objectNewInfoPatient.Email1 = sEmail;
        objectNewInfoPatient.PhoneNumber = sMobilePhone;
        objectNewInfoPatient.HomePhoneNumber = sHomePhone;
        objectNewInfoPatient.WorkPhoneNumber = sWorkPhone;
        objectNewInfoPatient.Address1 = sAddress;
        objectNewInfoPatient.Suburb = sSuburb;
        objectNewInfoPatient.Postcode = sPostcode;
        objectNewInfoPatient.State = sState;
        objectNewInfoPatient.Country = sCountry;
        objectNewInfoPatient.POBoxNo = sPOBoxNo;
        objectNewInfoPatient.MedicareNumber = sMedicareNo;
        objectNewInfoPatient.MedicareReferenceNumber = sMedicareRefNo;
        objectNewInfoPatient.MedicareExpiryDate = sMedicareExpiry;
        objectNewInfoPatient.PrivateHealthFund = sPrivateHealthFund;
        objectNewInfoPatient.MembershipNumber = sMembershipNo;
        objectNewInfoPatient.PHFRefNo = sPHFRefNo;
        objectNewInfoPatient.DVANumber = sDVANo;
        objectNewInfoPatient.DVACardColour = sCardColor;
        objectNewInfoPatient.DVADisability = sDVADisAbility;
        objectNewInfoPatient.PensionNumber = sPensionNo;
        objectNewInfoPatient.PensionExpiryDate = sPensionExpiry;
        objectNewInfoPatient.AccountHolderType = sAccountHolderType;
        objectNewInfoPatient.AccountHolder = sAccountHolder;

        if (infoTest.eformLink === "") {
          objectNewInfoPatient.DateAppointment = sDateAppointment;
          objectNewInfoPatient.HealthCareProvider = sHealthCareProvider;
        }

        console.log("--> OK");
      }
      console.log(objectNewInfoPatient);
    }
    //....................................................................................................abs

    // GET ALL INFORMATION OF DOCTOR TEMPLATE TO COMPARE AFTER OPEN EFORM

    await driver.wait(until.elementLocated(By.id("close_Button")), 30000);
    sleep.sleep(5);

    //const windowStart = await driver.getWindowHandle(); //get handle window first start
    //console.log("idWindowStart: " + windowStart);

    //..........................................................................................................................

    try {
      console.log(">> Default open dynamic section");
      for (var i = 0; i < totalSection; i++) {
        var temp = searchEnableButtom(i);
        //console.log(temp);
        if (temp !== null) {
          (await driver.findElement(By.id(temp))).click();
          sleep.msleep(500);
        }
      }
    } finally {
      console.log("--> OK");
    }

    //....................................................................................................................

    try {
      console.log(">> Default open section");
      for (var i = 0; i < totalSection; i++) {
        var temp = searchOpenSection(i);
        // console.log(temp);
        if (temp !== null) {
          (await driver.findElement(By.xpath(temp))).click();
          sleep.msleep(500);
        }
      }
    } finally {
      console.log("--> OK");
    }

    //......................................................................................................................
    try {
      var checkSrcSignature;
      var idSignature = loopSearchSomethingInEform(
        "eform_input_image_doctor",
        "type",
        "ref",
        eformTest.eform.fieldsByRef
      );
      console.log(">> Reload signature Doctor");
      for (var i = 0; i < idSignature.length; i++) {
        await driver
          .findElement(By.id(idSignature[i] + "_button_reload"))
          .click();
        sleep.sleep(5);
        var srcOfImg = await driver.findElement(By.id(idSignature[i]));
        srcOfImg.getAttribute("src").then(function(temp) {
          checkSrcSignature = temp;
        });
        await driver.wait(async () => checkSrcSignature !== undefined, 30000);
      }
    } finally {
      // check reload signature
      //console.log(checkSrcSignature);
      if (checkSrcSignature === "") {
        console.log("--> NOT OK");
      } else {
        console.log("--> OK");
      }
    }
    //....................................................................................................................

    try {
      console.log(">> Print test PDF file...");
      var idPrintButtom;
      idPrintButtom = "printButton_" + eformTest.eform.template.UID + "_bottom";
      //console.log(">> id Print Buttom" + eformTest.eform.template.UID);
      await driver.findElement(By.id(idPrintButtom)).click();
      await driver.wait(
        async () => (await driver.getAllWindowHandles()).length === 3,
        30000
      );
      if ((await driver.getAllWindowHandles()).length === 3) {
        sleep.sleep(2);
        await driver.switchTo().window(ideformWindow);
        testPrintPdf = true;
      }
    } finally {
      if (testPrintPdf) {
        console.log("--> OK");
      } else {
        console.log("--> NOT OK <--");
      }
    }
  })();
}
  */


//..........................................................................................
