//main program
//get modules
const fs = require("fs");
const sleep = require("sleep");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ attrkey: "ATTR" });

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
    ".xml";
  rawDataJasper = fs.readFileSync(dir);
} catch (error) {
  console.log("Not found " + dir);
  console.log("Update this file and run again");
  sleep.sleep(5);
  process.exit();
}
jasperTest = rawDataJasper.toString();
//onsole.log(jasperTest);
/*
parser.parseString(rawDataJasper, function(error, result) {
  if (error === null) {
    jasperTest = result;
  } else {
    console.log("Bug in jasper resources:" + error);
  }
});
*/
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
    if (
      parentObject[chil][dir] !== undefined &&
      parentObject[chil][dir] !== ""
    ) {
      if (parentObject[chil][dir] === thing) {
        var item = parentObject[chil][whatGet];
        if (item === "" || item === undefined) {
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
  {
    /*
  var totalDetail = jasperTest.jasperReport.detail.length;
  for (var i = 0; i < totalDetail; i++) {
    var totalBand = jasperTest.jasperReport.detail[i].band.length;
    for (var j = 0; j < totalBand; j++) {
      if (jasperTest.jasperReport.detail[i].band[j].frame !== undefined) {
        var totalFrame = jasperTest.jasperReport.detail[i].band[j].frame.length;
        for (var k = 0; k < totalFrame; k++) {
          if (
            jasperTest.jasperReport.detail[i].band[j].frame[k].textField !==
            undefined
          ) {
            var totaltextField =
              jasperTest.jasperReport.detail[i].band[j].frame[k].textField
                .length;
            for (var h = 0; h < totaltextField; h++) {
              var textFieldExpression =
                jasperTest.jasperReport.detail[i].band[j].frame[k].textField[h]
                  .textFieldExpression[0];
              var look = 0;
              //console.log(textFieldExpression.length);
              while (look < textFieldExpression.length) {
                var positionOfWhatFieldName = textFieldExpression.indexOf(
                  whatFieldname,
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
              //console.log(textFieldExpression);
            }
            //console.log(totaltextField);
          }
        }
      }
      if (jasperTest.jasperReport.detail[i].band[j].frame === undefined) {
        if (jasperTest.jasperReport.detail[i].band[j].textField !== undefined) {
          var totaltextField =
            jasperTest.jasperReport.detail[i].band[j].textField.length;
          for (var h = 0; h < totaltextField; h++) {
            var textFieldExpression =
              jasperTest.jasperReport.detail[i].band[j].textField[h]
                .textFieldExpression[0];
            //console.log(textFieldExpression);
            var look = 0;
            //console.log(textFieldExpression.length);
            while (look < textFieldExpression.length) {
              var positionOfWhatFieldName = textFieldExpression.indexOf(
                whatFieldname,
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
          }
          //console.log(totaltextField);
        }
      }
      //console.log(totalFrame);
    }
    //console.log(totalBand);
  }*/
  }
  var look = 0;
  //console.log(textFieldExpression.length);
  while (look < jasperTest.length) {
    var positionOfWhatFieldName = jasperTest.indexOf(whatFieldname, look);
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
} // return quatity of whatFieldName searched in jasper xml

function loopSearchBothNameandValueInJasper(whatFieldname, valueofFieldName) {
  var valueReturnAfterCompare = false;
  var quantityFieldNameFound = 0,
    quantityValueFound = 0;
  {
    /*
    var totalDetail = jasperTest.jasperReport.detail.length;
  for (var i = 0; i < totalDetail; i++) {
    var totalBand = jasperTest.jasperReport.detail[i].band.length;
    for (var j = 0; j < totalBand; j++) {
      if (jasperTest.jasperReport.detail[i].band[j].frame !== undefined) {
        var totalFrame = jasperTest.jasperReport.detail[i].band[j].frame.length;
        for (var k = 0; k < totalFrame; k++) {
          if (
            jasperTest.jasperReport.detail[i].band[j].frame[k].image !==
            undefined
          ) {
            var totalImage =
              jasperTest.jasperReport.detail[i].band[j].frame[k].image.length;
            for (var h = 0; h < totalImage; h++) {
              if (
                jasperTest.jasperReport.detail[i].band[j].frame[k].image[h]
                  .reportElement !== undefined
              ) {
                var totalReportElement =
                  jasperTest.jasperReport.detail[i].band[j].frame[k].image[h]
                    .reportElement.length;
                for (var l = 0; l < totalReportElement; l++) {
                  if (
                    jasperTest.jasperReport.detail[i].band[j].frame[k].image[h]
                      .reportElement[l].printWhenExpression !== undefined
                  ) {
                    var printWhenExpression =
                      jasperTest.jasperReport.detail[i].band[j].frame[k].image[
                        h
                      ].reportElement[l].printWhenExpression[0];
                    var look = 0;
                    //console.log(printWhenExpression);
                    while (look < printWhenExpression.length) {
                      var positionOfWhatFieldName = printWhenExpression.indexOf(
                        whatFieldname,
                        look
                      );
                      //console.log(positionOfWhatFieldName);
                      if (positionOfWhatFieldName !== -1) {
                        quantityFieldNameFound = quantityFieldNameFound + 1;
                        look = positionOfWhatFieldName + whatFieldname.length;
                        var positionOfValueOfFieldName = printWhenExpression.indexOf(
                          valueofFieldName,
                          look
                        );
                        if (positionOfValueOfFieldName !== -1) {
                          quantityValueFound = quantityValueFound + 1;
                        }
                        valueReturnAfterCompare = true;

                        //console.log(look);
                      } else {
                        break;
                      }
                    }
                  }
                }
              }
              //console.log(textFieldExpression);
            }
            //console.log(totaltextField);
          }
        }
      }
      if (jasperTest.jasperReport.detail[i].band[j].frame === undefined) {
        if (jasperTest.jasperReport.detail[i].band[j].image !== undefined) {
          var totalImage =
            jasperTest.jasperReport.detail[i].band[j].image.length;
          for (var h = 0; h < totalImage; h++) {
            if (
              jasperTest.jasperReport.detail[i].band[j].image[h]
                .reportElement !== undefined
            ) {
              var totalReportElement =
                jasperTest.jasperReport.detail[i].band[j].image[h].reportElement
                  .length;
              for (var l = 0; l < totalReportElement; l++) {
                if (
                  jasperTest.jasperReport.detail[i].band[j].image[h]
                    .reportElement[l].printWhenExpression !== undefined
                ) {
                  var printWhenExpression =
                    jasperTest.jasperReport.detail[i].band[j].image[h]
                      .reportElement[l].printWhenExpression[0];
                  var look = 0;
                  //console.log(printWhenExpression);
                  while (look < printWhenExpression.length) {
                    var positionOfWhatFieldName = printWhenExpression.indexOf(
                      whatFieldname,
                      look
                    );
                    //console.log(positionOfWhatFieldName);
                    if (positionOfWhatFieldName !== -1) {
                      quantityFieldNameFound = quantityFieldNameFound + 1;
                      look = positionOfWhatFieldName + whatFieldname.length;
                      var positionOfValueOfFieldName = printWhenExpression.indexOf(
                        valueofFieldName,
                        look
                      );
                      if (positionOfValueOfFieldName !== -1) {
                        quantityValueFound = quantityValueFound + 1;
                      }
                      valueReturnAfterCompare = true;
                      //console.log(look);
                    } else {
                      break;
                    }
                  }
                }
              }
            }
            //console.log(textFieldExpression);
          }
          //console.log(totaltextField);
        }
      }
      //console.log(totalFrame);
    }
    //console.log(totalBand);
  }
  //console.log(totalDetail);
  //console.log(quantityFieldNameFound + " | " + quantityValueFound);
  return [quantityFieldNameFound, quantityValueFound];
*/
  }
  var look = 0;
  //console.log(printWhenExpression);
  while (look < jasperTest.length) {
    var positionOfWhatFieldName = jasperTest.indexOf(
      whatFieldname,
      look
    );
    //console.log(positionOfWhatFieldName);
    if (positionOfWhatFieldName !== -1) {
      quantityFieldNameFound = quantityFieldNameFound + 1;
      look = positionOfWhatFieldName + whatFieldname.length;
      var positionOfValueOfFieldName = jasperTest.indexOf(
        valueofFieldName,
        look
      );
      if (positionOfValueOfFieldName !== -1) {
        quantityValueFound = quantityValueFound + 1;
      }
      valueReturnAfterCompare = true;

      //console.log(look);
    } else {
      break;
    }
  }
  return [quantityFieldNameFound, quantityValueFound];
} // search quantity of Field Name and Value and return quantity of them type array;

function loopSearchSignatureInJasper(whatFieldname) {
  var valueReturnAfterCompare = false;
  var quantityFieldNameFound = 0;
  var totalDetail = jasperTest.jasperReport.detail.length;
  for (var i = 0; i < totalDetail; i++) {
    var totalBand = jasperTest.jasperReport.detail[i].band.length;
    for (var j = 0; j < totalBand; j++) {
      if (jasperTest.jasperReport.detail[i].band[j].frame !== undefined) {
        var totalFrame = jasperTest.jasperReport.detail[i].band[j].frame.length;
        for (var k = 0; k < totalFrame; k++) {
          if (
            jasperTest.jasperReport.detail[i].band[j].frame[k].image !==
            undefined
          ) {
            var totalImage =
              jasperTest.jasperReport.detail[i].band[j].frame[k].image.length;
            for (var h = 0; h < totalImage; h++) {
              if (
                jasperTest.jasperReport.detail[i].band[j].frame[k].image[h]
                  .imageExpression !== undefined
              ) {
                var imageExpression =
                  jasperTest.jasperReport.detail[i].band[j].frame[k].image[h]
                    .imageExpression[0];
                var look = 0;
                //console.log(imageExpression);
                while (look < imageExpression.length) {
                  var positionOfWhatFieldName = imageExpression.indexOf(
                    whatFieldname,
                    look
                  );
                  //console.log(positionOfWhatFieldName);
                  if (positionOfWhatFieldName !== -1) {
                    quantityFieldNameFound = quantityFieldNameFound + 1;
                    look = positionOfWhatFieldName + whatFieldname.length;
                    valueReturnAfterCompare = true;
                    //console.log(look);
                  } else {
                    break;
                  }
                }
              }
              //console.log(textFieldExpression);
            }
            //console.log(totaltextField);
          }
        }
      }
      if (jasperTest.jasperReport.detail[i].band[j].frame === undefined) {
        if (jasperTest.jasperReport.detail[i].band[j].image !== undefined) {
          var totalImage =
            jasperTest.jasperReport.detail[i].band[j].image.length;
          for (var h = 0; h < totalImage; h++) {
            if (
              jasperTest.jasperReport.detail[i].band[j].image[h]
                .imageExpression !== undefined
            ) {
              var imageExpression =
                jasperTest.jasperReport.detail[i].band[j].image[h]
                  .imageExpression[0];
              var look = 0;
              //console.log(imageExpression);
              while (look < imageExpression.length) {
                var positionOfWhatFieldName = imageExpression.indexOf(
                  whatFieldname,
                  look
                );
                //console.log(positionOfWhatFieldName);
                if (positionOfWhatFieldName !== -1) {
                  quantityFieldNameFound = quantityFieldNameFound + 1;
                  look = positionOfWhatFieldName + whatFieldname.length;
                  valueReturnAfterCompare = true;
                  //console.log(look);
                } else {
                  break;
                }
              }
            }
            //console.log(textFieldExpression);
          }
          //console.log(totaltextField);
        }
      }
      //console.log(totalFrame);
    }
    //console.log(totalBand);
  }
  //console.log(totalDetail);
  //console.log(quantityFieldNameFound + " | " + quantityValueFound);
  return quantityFieldNameFound;
}

//..................................................................................................................
console.log(".>..>>..>>>..Loading................");
sleep.sleep(2); // sleep 2s to process number
console.log(".>..>>..>>>..Completed..>>>...>>>>>>");
sleep.sleep(1);
//...................................................................................................................
console.log(">> Check for JASPER file \n");

{
  console.log(">>List text fields error: ");
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
    var numberValueFound = loopSearchSomethingInJasper(
      arrListFieldNameTextField[i]
    ); //search with jasper file
    if (numberValueFound !== 2) {
      console.log("--> " + arrListFieldNameTextField[i] + "\n");
    }
  } // search bug for text field
  sleep.sleep(1);
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
  console.log("\n>>List radio fields error: ");
  console.log(
    "*** Noted: \n      + id-> not see id in eform; \n      + field name-> not see field name in jasper \n"
  );
  for (var i = 0; i < arrListNameRadioField.length; i++) {
    var arrQuantityofThem = loopSearchBothNameandValueInJasper(
      arrListNameRadioField[i],
      arrListValueRadioCompare[i]
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

    var checkFieldIdofName = arrListNameRadioField[i].indexOf("field", 0);
    if (checkFieldIdofName !== -1) {
      console.log("--> " + arrListNameRadioField[i]);
    }

    var checkFieldIdofValue = arrListValueRadioCompare[i].indexOf("field", 0);
    if (checkFieldIdofValue !== -1) {
      console.log("--> " + arrListValueRadioCompare[i]);
    }

    var checkQuantityFieldName = seachQuantityofSomething(
      arrListNameRadioField,
      arrListNameRadioField[i]
    );
    if (
      checkQuantityFieldName !== arrQuantityofThem[0] &&
      checkFieldIdofName === -1
    ) {
      console.log("--> " + arrListNameRadioField[i]);
    }

    //var checkQuantityValeField = seachQuantityofSomething(arrListValueRadioCompare, arrListValueRadioCompare[i]);
    if (1 !== arrQuantityofThem[1] && checkFieldIdofValue === -1) {
      console.log("> Value: " + arrListValueRadioCompare[i] + "\n");
    }
    //console.log(arrQuantityofThem + " || " +arrListNameRadioField[i] + " || " + arrListValueRadioCompare[i]);
  } //search bug for radio
  sleep.sleep(1);
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
  console.log("\n>>List checkbox fields error: ");
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

    var checkFieldIdofName = arrListNameCheckboxField[i].indexOf("field", 0);
    if (checkFieldIdofName !== -1) {
      console.log("--> " + arrListNameCheckboxField[i]);
    }

    var checkFieldIdofValue = arrListValueCheckboxCompare[i].indexOf(
      "field",
      0
    );
    if (checkFieldIdofValue !== -1) {
      console.log("--> " + arrListValueCheckboxCompare[i]);
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
      console.log("--> " + arrListNameCheckboxField[i]);
    }

    //var checkQuantityValeField = seachQuantityofSomething(arrListValueRadioCompare, arrListValueRadioCompare[i]);
    if (1 !== arrQuantityofThem[1] && checkFieldIdofValue === -1) {
      //console.log(arrQuantityofThem[1]);
      console.log("> Value: " + arrListValueCheckboxCompare[i] + "\n");
    }

    if (arrListValueCheckboxCompare[1] !== "yes") {
      console.log(
        "> Value not correct at field name: " + arrListNameCheckboxField[i]
      );
    }
    //console.log(arrQuantityofThem);
    //console.log(arrQuantityofThem + " || " +arrListNameRadioField[i] + " || " + arrListValueRadioCompare[i]);
  } // search bug for checkbox
  sleep.sleep(1);
  //....................................................................................................................................

  console.log(">>List signature error: ");
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
    var numberValueFound = loopSearchSignatureInJasper(
      arrListFieldNameSignatureDoctor[i]
    ); //search with jasper file
    //console.log(numberValueFound);
    if (numberValueFound !== 1) {
      console.log("--> " + arrListFieldNameSignatureDoctor[i] + "\n");
    }
  } // search bug for doctor signature

  for (var i = 0; i < arrListFieldNameSignaturePatient.length; i++) {
    var numberValueFound = loopSearchSignatureInJasper(
      arrListFieldNameSignaturePatient[i]
    ); //search with jasper file
    //console.log(numberValueFound);
    if (numberValueFound !== 1) {
      console.log("--> " + arrListFieldNameSignaturePatient[i] + "\n");
    }
  } // search bug for patient signature
  sleep.sleep(1);
}

//............................................................................................................
console.log(">> Check for EFORM file \n");

{
  console.log(".>..>>..>>>..Loading................");
  sleep.sleep(5); // sleep 5s to process number
  console.log(".>..>>..>>>..Completed..>>>...>>>>>>");

  //...................................................................................................

  //......................................................................................................................................
  //control chrome make something
  const { Builder, By, Key, until } = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  chrome.setDefaultService(
    new chrome.ServiceBuilder("./WebDriver/bin/chromedriver.exe").build()
  );

  (async function rootProgram() {
    let driver = await new Builder().forBrowser("chrome").build();
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
      console.log(">> Navigate to eform...");
      await driver.wait(
        until.elementLocated(By.xpath("//*[@alt='REDIMED']")),
        30000
      );
      await driver.get(infoTest.eform);
    } finally {
      console.log("--> OK");
    }

    await driver.wait(until.elementLocated(By.id("close_Button")), 30000);
    sleep.sleep(3);
    const windowStart = await driver.getWindowHandle(); //get handle window first start
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
        async () => (await driver.getAllWindowHandles()).length === 2,
        30000
      );
      if ((await driver.getAllWindowHandles()).length === 2) {
        await driver.switchTo().window(windowStart);
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

//..........................................................................................
