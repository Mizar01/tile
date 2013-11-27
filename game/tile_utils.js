TilesConfig = {
	"size" : 3,
	"distance": 3.2,
}

TileMapConfig = function() {
	this.map = []
	this.pairedBeams = {}
	this.startTile = null
	this.endTile = null
	this.getTile = function(mapx, mapz) {
        if (this.map[mapx] != null && this.map[mapx][mapz] != null) {
        	//console.log(this.map[mapx][mapz])
            return this.map[mapx][mapz]
        }
        return null
    }
    this.loadMap = function (mapName) {
    	this.map = []
    	this.pairedBeams = {}
    	var ms = this.mapStrings[mapName]
    	var rows = ms.split("-")
    	//detect h, w
    	var h = rows.length
    	var w = rows[0].split(",").length
    	for (var ci = 0; ci < w; ci++) {
    		this.map[ci] = []
    		//var vals = rows[ri].split(",")
    		for (var ri = 0; ri < h; ri++) {
    	    	var value = rows[ri].split(",")[ci]
    	    	if (value != null && value != "") {
    	    		var type = value.substring(0,2)
    	    		var typeName = this.symbolMap[type]
    	    		var params = ""
    	    		if (value.length > 2) {
    	    			params = value.substring(2, value.length)
    	    		}
    	    		if (typeName) { 
	    	    		var t = new window[typeName](ci, ri)
		    	    	if (type == "ST") {
		    	    		this.startTile = t
		    	    	}else if (type == "EN") {
		    	    		this.endTile = t
		    	    	}else if (type == "BE") {
		    	    		t.pairKey = params
		    	    		if (!this.pairedBeams[t.pairKey]) {
		    	    			this.pairedBeams[t.pairKey] = []	
		    	    		}
		    	    		this.pairedBeams[t.pairKey].push(t)
		    	    	}
		    	    	gameManager.registerActor(t)
			            this.map[ci][ri] = t
			        }
		        }
    		}
    	}



    }

	this.symbolMap =   { "ST": "StartTile", 
						 "01": "Tile",
						 "02": "Tile2Go",
						 "03": "Tile3Go",
						 "EN": "EndTile",
						 "SS": "TileSwitchStatusAround",
						 "BE": "TileBeam",
						}


    this.mapStrings = {
    	"test" :     "ST,**,01,01,BE01,01-" +
	                 "01,02,01,03,**,01-" +
	                 "01,01,01,01,**,01-" +
	                 "01,01,SS,02,**,EN-" +
	                 "01,03,01,02,BE01,01-" +
	                 "01,01,01,02,01,01-",

    }
}