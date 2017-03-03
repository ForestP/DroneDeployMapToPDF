
/* 
Function Name: generatePdfFromTile

  Main function to get all data for PDF and then start process of creating PDF

Outputs/Effects
  Gets Plan, Tiles, and annotations for current plan and calls function
  to create a PDF  
*/
function generatePdfFromTile() {
  console.log("called");
  dronedeploy.onload(function(){ dronedeploy.Track.successCondition()});
  statusText.innerHTML = 'Generating PDF';
	
  getCurrentViewedPlan()
    .then(function(plan){           getTilesFromPlan(plan)
    .then(function(tileInformation){  getAnnotations(plan)
    .then(function(annotations){
        return createAndSendAnnotationsWithData(plan, tileInformation, annotations);
    });

      });
    });

}

/* 
Function Name: getCurrentViewedPlan

retrieve the currently viewed plan and return plan object in response from server

Outputs/Effects
   Return the current plan object
*/
function getCurrentViewedPlan() {
	// Get the current one time
	return dronedeploy.Plans.getCurrentlyViewed();
  }
/* 
Function Name: getTilesFromPlan

  retrieve the tile info from plan argument and 
  return tile object in response from server

Inputs
  A Plan object

Outputs/Effects
   Return the tiles from the plan object
*/
function getTilesFromPlan(plan) {
	return dronedeploy.Tiles.get({planId: plan.id, layerName: 'ortho', zoom: 20});
}
/* 
Function Name: getAnnotations

Inputs
  A Plan object

Outputs/Effects
   Return the annotations from the plan object
*/
function getAnnotations(plan){
  return dronedeploy.Annotations.get(plan.id);
}


/* 
Function Name: createAndSendAnnotationsWithData

verifies annotation data and creates body object to pass to pdf server

Inputs
  plan object, annotations object, and tileInfo from tile object

Outputs/Effects
  pass body of PDF to sendData function to create PDF
*/
function createAndSendAnnotationsWithData(plan, tileInfo, annotations) {
  var volumeAnnotations = annotations.filter(function (annotation) {
    return annotation.annotationType === 'VOLUME';
  });
  var annotationsWithData = [];
  var annotationDataTasks = annotations.map(function (annotation) {
    if (annotation.annotationType !== 'VOLUME') {
      annotationsWithData.push({ annotation: annotation });
      return Promise.resolve();
    }
    return new Promise(makeVolumePromise(annotation, annotationsWithData));
  });
  Promise.all(annotationDataTasks).then(function () {
    var body = {
      plan: plan,
      tiles: tileInfo,
      annotations: annotationsWithData
    };
    sendData(plan.id, body).then(function () {
      return handleDataSent(plan.id);
    }).catch(function () {
      return handleDataSent(plan.id);
    });
  }).catch(function (error) {
    return console.error(error);
  });
};
/* 
Function Name: sendData

sends all data gathered to server to create PDF

Inputs
  PDF body object, id of plan

Outputs/Effects
  passes body to server to create PDF
*/
function sendData(planId, body) {
  return fetch('https://pdf-annotate.herokuapp.com/' + planId, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
};
/* 
Function Name: openInNewTab

  opens created server url in 

Inputs
  URL of created PDF

Outputs/Effects
  Open PDF in a new tab
*/
function openInNewTab(url) {
  dronedeploy.getExperimentalApi(function(exAPI) {
    exAPI.Link.open(url);
  });
}
/* 
Function Name: handleDataSent

  callback for when data is sent to server to watch for return 

Inputs
  planID

Outputs/Effects
  sets app link to redirect to created PDF of map
*/
function handleDataSent(planId) {
  var reportUrl = 'https://pdf-annotate.herokuapp.com/' + planId;
  createpdfbtn.removeEventListener('click', generatePdfFromTile);
  statusText.innerHTML = 'View Map PDF';
  createpdfbtn.onclick = function() {
    openInNewTab(reportUrl);
  }
  openInNewTab(reportUrl);
};
/* 
Function Name: makeVolumePromise

  A promise for returning the volume of the annotations created
  Used to populate table on created PDF

Inputs
  annotation 
  accumulator

Outputs/Effects
  returns either the volume of the annnotation or an error if one is caught
*/
function makeVolumePromise(annotation, accumulator) {
  return function (resolve, reject) {
    dronedeploy.Annotations.getVolume(annotation.id).subscribe(function (volume) {
      accumulator.push({ annotation: annotation, volume: volume });
      resolve(volume);
    }, function (error) {
      return reject(error);
    });
  };
};

/* 
Function Name: onLoad

  Sets listener for main button and starts process of creating PDF

Outputs/Effects
  calls 'generatePdfFromTile' to begin the PDF generation process
*/
function onLoad() {
  createpdfbtn.addEventListener('click', generatePdfFromTile);
};

// sets tag for status label in index.html
var statusText = document.getElementById("statusTxt");

// calls the 'onLoad' function to start the process
dronedeploy.onload(onLoad);


