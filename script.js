dronedeploy.onload(function(){
  console.log('DroneDeploy Api: ', dronedeploy);
  generateButton.addEventListener("click", generatePdfFromTile);
});

var currentPlan;


function generatePdfFromTile() {
	var plan = getCurrentViewedPlan();

	var tileInfo = getTilesFromPlan(plan);


}

function getCurrentViewedPlan() {
	// Get the current one time
	dronedeployApi.Plans.getCurrentlyViewed()
  	.then(function(plan){
    	console.log(plan);
  	});

  	return plan;
  }


function getTilesFromPlan(plan) {
	dronedeployApi.Tiles.get({planId: '5605c0e5752afc005a000004', layerName: 'ortho', zoom: 16})
  		.then(function(tileInformation){ 
  			console.log(tileInformation) 

  		});
  		return tileInformation;
}
