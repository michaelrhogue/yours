(function( highway, $ ) {
    'use strict';

    highway.laneWidth = 12; //feet
    highway.roadLength = 500; // in scope
	highway.numLanes = 6; // 2 straight, 1 left, 1 right, 2 straight in opposite direction
	highway.intersectionLength = highway.laneWidth * (highway.numLanes - 1); //the right lane does not make the intersection wider
	highway.lanesPerDirection = 4;
	highway.speedLimit = 45; // mph
	highway.carSpacing = 5; // distance in feet between front and rear bumpers
	highway.vehiclesInScope = [];
	highway.sensorsActiveTimer = 0; // seconds the sensors are active, they are only present on the NW or SE lanes
	highway.lightTimer = 0;
	highway.activeLights = 0;
	highway.activeLightChoices = [ 'NE/SW Left', 'NE/SW', 'NW/SE Left', 'NW/SE' ]; // TODO: Most intersections have yellow lights
	highway.intersectionPerimeters = calculatePlots(highway.intersectionLength / 2);
	
	// vehicles should move into right or left turn lanes about 100 feet before the intersection
	highway.laneChangePlots = calculatePlots(highway.intersectionLength / 2 + 100); 

	var main = setInterval(function(){action();}, 1000);

	function action(){
		handleNewVehicles()
		.then(handleSensors())
		.then(handleStopLights())
		.then(drive())
		.catch(oops);
	}

	function handleSensors(){
		if(sensorsActive() == true){
			++highway.sensorsActiveTimer;
		}

		// reset the timer if the sensor is no longer active
		else{
			highway.sensorsActiveTimer = 0;	
		}

		return Promise.resolve();
	}

	function sensorsActive(){
		return false; // TODO: buiild this feature
	}

	function handleStopLights(){
		//TODO: NE and SW lights should remains steady unless the sensor is active for more than 5 seconds
		++highway.lightTimer;
		if(highway.activeLights == 0 || highway.activeLights == 2){
			if(highway.lightTimer == 30){
				console.log("Left turn lane ending");
				advanceLight();
			}
		}
		else{
			if(highway.lightTimer >= 180){
				console.log("Light changing");
				advanceLight();
				highway.lightTimer = 0;
			}	
		}

		return Promise.resolve();
	}

	function advanceLight(){
		++highway.activeLights;
		highway.activeLights = highway.activeLights % highway.activeLightChoices.length;
	}

	function drive(){
		for(var i in highway.vehiclesInScope){
			let vehicle = highway.vehiclesInScope[i];
			if(isTimeToChangeLanges(vehicle) == true){
				changeLanes(vehicle);
			}
			if(ensureForwardDriveSafety(vehicle) == true){
				if(isTimeToTurn(vehicle) == true){
					turn(vehicle, i);
				}
				else{
					moveForward(vehicle);
				}
			}
		}

		return Promise.resolve();
	}

	function moveForward(vehicle){
		console.log("moving forward");

		let cardinals = vehicle.intercardinalLane.choiceName.split(""),
    		xPlacementOperator = getDirectionalOperator(cardinals[0], "drive"),
    		yPlacementOperator = getDirectionalOperator(cardinals[1], "drive"),
    		speedIncrementer = feetPerSecond(vehicle.speed),
    		xFront = vehicle.position.front.x + (speedIncrementer * xPlacementOperator),
    		yFront = vehicle.position.front.y + (speedIncrementer * yPlacementOperator),
    		xBack = vehicle.position.back.x + (speedIncrementer * xPlacementOperator),
    		yBack = vehicle.position.back.y + (speedIncrementer * yPlacementOperator);

		vehicle.position = {
    		"front": {
    			"x": xFront,
    			"y": yFront
    		},
    		"back": {
    			"x": xBack,
    			"y": yBack
    		}
    	};
	}

	function isTimeToTurn(vehicle){
		if((vehicle.laneNum == 1 || vehicle.laneNum == 4) && approachingIntersection() == true){
			return true;
		}

		return false;
	}

	function turn(vehicle, i){
		console.log(vehicle.vehicle.types + " turned " + vehicle.plannedTurn.choiceName + ".");

		// now that the vehicle has consumed the intersection, we can remove the vehicle from memory
		highway.vehiclesInScope.splice(i, 1);
	}

	function isTimeToChangeLanges(vehicle){
		if(withinTurnPerimeter(vehicle) == true && vehicle.plannedTurn.choiceName != "straight" && (vehicle.laneNum == 2 || vehicle.laneNum == 3)){
			if(ensureLaneChangeSafety(vehicle)){
				return true;
			}
		}

		return false;
	}

	function withinTurnPerimeter(vehicle){
		return false; // TODO: Build this out
	}

	function approachingIntersection(){
		return false; // TODO: Build this out
	}

	function changeLanes(vehicle){
		console.log("Changing lanes");
		if(vehicle.plannedTurn == "left"){
			vehicle.laneNum = 1;
		}
		else if(vehicle.plannedTurn == "right"){
			vehicle.laneNum = 4;
		}
	}

	function ensureForwardDriveSafety(vehicle){
		// TODO: check that no vehicles are within highway.carSpacing distance in front, confirm the vehicle is not about to enter intersection if light is red
		return true;
	}

	function ensureLaneChangeSafety(vehicle){
		return true; //TODO: Implement this
	}

	function ensureRightTurnSafety(vehicle){
		return true; //TODO: Implement this
	}

	function plotFourLanes(startX, startY, xOperator, yOperator){
		return {
			"L1":{"x": startX, "y": startY},
			"L2":{
				"x": startX + (highway.laneWidth * xOperator), 
				"y": startY + (highway.laneWidth * yOperator)
			},
			"L3":{
				"x": startX + (highway.laneWidth * 2 * xOperator), 
				"y": startY + (highway.laneWidth * 2 * yOperator)
			},
			"L4":{
				"x": startX + (highway.laneWidth * 3 * xOperator), 
				"y": startY + (highway.laneWidth * 3 * yOperator)
			}
		};
	}

	function calculatePlots(offset){
		let negOne = -1,
			ne = plotFourLanes(offset * negOne, offset * negOne, negOne, negOne),
			nw = plotFourLanes(offset, offset * -1, 1, -1),
			sw = plotFourLanes(offset, offset, 1, 1),
			se = plotFourLanes(offset * -1, offset, -1, 1);

		return {
			"NE": ne,
			"NW": nw,
			"SW": sw,
			"SE": se
		};
	}

	function handleNewVehicles(){
		console.log('Checking if a new vehicle is coming.');
		if(randomRangeInt(1,100) < 12){
			placeVehicle(new Vehicle());
		}

		return Promise.resolve();
	}

	function oops(){
		console.log("Something went wrong!");
	}

	function Vehicle(){
    	let intercardinal = getVehicleIntercardinal(),
    		plannedTurn = getVehicleNavigation();

    	this.intercardinalLane = intercardinal;
    	this.vehicle = getVehicleType();
    	this.plannedTurn = plannedTurn.choiceName;
    	this.speed = getVehicleSpeed();
    	this.laneNum = getVehicleStartLane(this.plannedTurn);
    	this.laneName = nameTheLane(intercardinal);
    	console.log("New vehicle entering scope.  It's a " + this.vehicle.typeName + " traveling " + this.laneName + " at " + this.speed + " mph and planning to go " + plannedTurn.choiceName + ".");
    }

    function getVehicleIntercardinal(){
    	let vectors = [
    		{
    			"choiceName": "SW",
    			"weight": 0.42
    		},
    		{
    			"choiceName": "NE",
    			"weight": 0.32
    		},
    		{
    			"choiceName": "NW",
    			"weight": 0.14
    		},
    		{
    			"choiceName": "SE",
    			"weight": 0.12
    		}
    	];

    	return chooseRandom(vectors);
    }

    function getVehicleType(){
    	let types = [
    		{
    			"typeName": "mini",
    			"length": 13, //feet
    			"weight": 0.07 //likelihood to select this choice
    		},
    		{
    			"typeName": "coupe",
    			"length": 14,
    			"weight": 0.22
    		},
    		{
    			"typeName": "sedan",
    			"length": 15,
    			"weight": 0.26	
    		},
    		{
    			"typeName": "pickup",
    			"length": 20,
    			"weight": 0.24
    		},
    		{
    			"typeName": "box truck",
    			"length": 26,
    			"weight": 0.06
    		},
    		{
    			"typeName": "semi truck",
    			"length": 73,
    			"weight": 0.15
    		}
    	];

    	return chooseRandom(types);    	
    }

    function getVehicleNavigation(){
    	let choices = [
    		{
    			"choiceName": "straight",
    			"weight": 0.6  //likelihood to select this choice
    		},
    		{
    			"choiceName": "left",
    			"weight": 0.29
    		},
    		{
    			"choiceName": "right",
    			"weight": 0.11
    		}
    	];

    	return chooseRandom(choices);
    }

    function chooseRandom(object){
    	let randSelect = randomRangeInt(1, 100) / 100;
    	let cumulativeScore = 0;

    	// this will produce a proportionally-weighted selection, based on the accuracy of JS Math.random()
    	for(var i in object){
    		cumulativeScore += object[i].weight;
    		if(randSelect <= cumulativeScore){
    			return object[i];
    		}
    	}
    }

    function getVehicleSpeed(){
    	return randomRangeInt(30, 55);
    }

    function getVehicleStartLane(plannedTurn){
    	//	lanes 2 and 3 are the straight lanes, and are the only ones available to drive in at starting position
    	if(plannedTurn == "right" || plannedTurn == "left"){
    		return plannedTurn == "left" ? 2 : 3;
    	}
    	return randomRangeInt(2, 3); 
    }

    function randomRangeInt(min, max){
	    return Math.floor(Math.random() * (max-min+1) + min);
	}

	function nameTheLane(intercardinal){
    	let cardinals = intercardinal.choiceName.split("");
    	return oppositeDirection(cardinals[0], 'X')+oppositeDirection(cardinals[1], 'Y')+' Bound';
    }

    function feetPerSecond(mph){
    	let feetPerMile = 5280;
    	return feetPerMile * mph / 60 / 60;
    }

    function placeVehicle(vehicle){
    	if(isThereRoom(vehicle.intercardinalLane, vehicle.laneNum) == false){
    		delete vehicle.position;
    		console.log("Driver chose alternate route.");
    	}

    	vehicle.position = calculateStartingPosition(vehicle);

    	// Driving needs to take place in order, not by which lane, but by which cars are in front.  This should facilitate that need.
    	highway.vehiclesInScope.push(vehicle);
    }


    /* TODO: This calculation is currently repeated each time a vehicle enters scope, which is inneficient */
    function calculateStartingPosition(vehicle){
		let laneOffset = (vehicle.laneNum - 1) * highway.laneWidth, // 0,0 in this program is the center of the intersection for all lanes of travel
    		cardinals = vehicle.intercardinalLane.choiceName.split(""),
    		xPlacementOperator = getDirectionalOperator(cardinals[0], "placement"),
    		yPlacementOperator = getDirectionalOperator(cardinals[1], "placement"),
    		xFrontIntersection = laneOffset * xPlacementOperator,
    		yFrontIntersection = laneOffset * yPlacementOperator,
    		xFront = xFrontIntersection + (highway.roadLength / 2 * xPlacementOperator),
    		yFront = yFrontIntersection + (highway.roadLength / 2 * yPlacementOperator);

    	return {
    		"front": {
    			"x": xFront,
    			"y": yFront
    		},
    		"back": {
    			"x": xFront + (vehicle.vehicle.length * xPlacementOperator),
    			"y": yFront + (vehicle.vehicle.length * yPlacementOperator)
    		}
    	};
    }

    /* 
     * Placement is calculated from the center of the intersection
     * Driving would be calculated in the opposing direction
     **/
    function getDirectionalOperator(cardinal, type){
    	if(type == "placement"){
			return (cardinal == 'N' || cardinal == 'E') ? 1 : -1;    		
    	}

    	return (cardinal == 'N' || cardinal == 'E') ? -1 : 1;
    }

    
    function oppositeDirection(cardinal, plane){
    	let dirs = (plane == 'X') ? ['N', 'S'] : ['E', 'W'];
    	return (dirs[0] == cardinal) ? dirs[1] : dirs[0];
    }

    function isThereRoom(intercardinal, laneNum){
    	return true; // TODO: Build this out
    }

    
}( window.highway = window.highway || {}, jQuery ));
