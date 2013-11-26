TilesConfig = {
	"size" : 3,
	"distance": 3.2,
}

TileMapConfig = function() {
	this.map = []
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
    	    		var typeName = this.symbolMap[value]
    	    		if (typeName) { 
	    	    		var t = new window[typeName](ci, ri)
		    	    	if (value == "S") {
		    	    		this.startTile = t
		    	    	}else if (value == "E") {
		    	    		this.endTile = t
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
						 //"BE": "TileBeam",
						}


    this.mapStrings = {
    	"test" :     "ST,**,01,01,BE,01-" +
	                 "01,02,01,03,**,01-" +
	                 "01,01,01,01,**,01-" +
	                 "01,01,SS,02,**,EN-" +
	                 "01,03,01,02,BE,01-" +
	                 "01,01,01,02,01,01-",

    }
}

BaseTile = function(mapX, mapZ, props) {
	ACE3.Actor3D.call(this);
	this.props = props || {}
	this.mass = 0;
	this.width = TilesConfig.size;

	this.color = this.props.color || 0x000000
	this.mapX = mapX
	this.mapZ = mapZ
	// this.face1Shader = this.props.face1Shader || "borderShader"
	// this.face2Shader = this.props.face2Shader || "borderShader"
	// this.shader = this.face1Shader  //default shader 

	this.obj = new THREE.Object3D()
	var vec3pos = new THREE.Vector3(mapX * TilesConfig.distance, 3, mapZ * TilesConfig.distance)
	this.obj.position = new THREE.Vector3(vec3pos.x, vec3pos.y, vec3pos.z); 

	this.tileObj = this.defineObj()
	this.obj.add(this.tileObj)

	this.isFlipping = false
	this.flipSpeed = 0.12

	if (this.props.pickable) {
		this.pickMaster = this.tileObj
		this.setPickable()
	}

	
	this.side = -1

	this.enabled = true






}

BaseTile.extends(ACE3.Actor3D, "BaseTile");

/**
* Function that must be implemented by inheriting objects
*/
BaseTile.prototype.defineObj = function() {
	console.log("defineObj must be implemented by sub classes")
}

BaseTile.prototype.run = function() {
	this.runFlipping()
}

BaseTile.prototype.runFlipping = function() {
	if (this.isFlipping) {
		if (this.side == -1) {
			this.obj.rotation.z += this.flipSpeed
			if (Math.abs(Math.PI - this.obj.rotation.z) < this.flipSpeed * 1.1) {
				this.obj.rotation.z = Math.PI
				this.isFlipping = false
				this.side = 1
			}
		}else if (this.side == 1) {
			this.obj.rotation.z -= this.flipSpeed
			if (Math.abs(this.obj.rotation.z) < this.flipSpeed * 1.1) {
				this.obj.rotation.z = 0
				this.isFlipping = false
				this.side = -1
			}
		}
		// console.log("rotating : " + this.obj.rotation.z)
		this.obj.__dirtyRotation = true
	}	
}

BaseTile.prototype.action = function() {
	if (this.enabled) {
		var res = this.flip()
	}
	if (res) {
		this.trigger()
	}
}

BaseTile.prototype.flip = function() {
	if (this.props.flippable) {
		if (!this.isFlipping) {
			if (this.canBeFlipped()) {
				this.isFlipping = true
				return true
			}
		}
	}
	return false
}

/**
* Collateral action/trigger used basically if the flip has been succesfully started
*/ 
BaseTile.prototype.trigger = function() {}

/**
* it returns the current side of the tile if it's still , or the 
* side where the tile will be at the end of the flipping 
* When a tile is not flipable it returns 0.
*/
BaseTile.prototype.getFlipSide = function() {
	if (!this.props.flippable) {
		return this.side
	}
	if (this.isFlipping) {
		return -1 * this.side
	}else {
		return this.side
	}
}

/**
* Basic conditions for flipping, based on some other tile attributes
*/
BaseTile.prototype.canBeFlipped = function(min, max) {
	min = min || 1
	max = max || 8
	var ntml = this.getNearTiles().length
	if (ntml >= min && ntml <= max) {
		return true
	}
	return false
}

/**
* Get all (max of 4) the adjacent Tiles. If filterEnabled = true (default)
* the function returns only enabled tiles.
* The default filtering Side is 1
* If the side is specified and differs from 0 , i count only the tiles flipped on specified side.
* default 
* the side 0 means i'm not interested on what side.
* filtering Enabled has precedence on filtering Sides.
*/
BaseTile.prototype.getNearTiles = function(filterSide, filterEnabled) {
	filterEnabled = filterEnabled || true
	filterSide = filterSide || 1
	var ntm = []
	var i = this.mapX
	var j = this.mapZ
	var pairVer = [ 
					[i-1, j], 
					[i+1, j], 
					[i, j-1], 
					[i, j+1]
				  ]
	for (i in pairVer) {
		// console.log(pairVer[i])
		var t = tileMapConfig.getTile(pairVer[i][0], pairVer[i][1])
		if (t != null) {
			if (!filterEnabled || (filterEnabled && t.enabled)) {
				if (filterSide == 0 || t.getFlipSide() == filterSide) {
					ntm.push(t)
				}
			}
		}
	}
	return ntm
}



BaseTile.prototype.disable = function() {
	this.hide()
	this.tileObj.visible = false
	this.enabled = false
}

BaseTile.prototype.enable = function() {
	this.show()
	this.tileObj.visible = true
	this.enabled = true
}

BaseTile.prototype.toggleStatus = function() {
	if (this.enabled) {
		this.disable()
	}else {
		this.enable()
	}
}








Tile = function(mapX, mapZ, props) {
	BaseTile.call(this, mapX, mapZ, {color: 0x000000, flippable: true, pickable: true});
}

Tile.extends(BaseTile, "Tile");

Tile.prototype.defineObj = function(color1, color2, borderColor1, borderColor2, shader1, shader2, texture1, texture2) {
	var c1 = color1 || 0x000000
	var c2 = color2 || 0xffffff
	var bc1 = borderColor1 || 0x0000ff
	var bc2 = borderColor1 || 0x00ff00
	var s1 = shader1 || "borderShader"
	var s2 = shader2 || "borderShader"
	var t1 = texture1 || ""
	var t2 = texture2 || ""

	this.uniform = ACE3.Utils.getStandardUniform();
	this.uniform.borderSize = { type: 'f', value: '0.1'};
	this.uniform.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(bc1)};
	this.uniform.color.value = ACE3.Utils.getVec3Color(c1);

	this.uniform2 = ACE3.Utils.getStandardUniform();
	this.uniform2.borderSize = { type: 'f', value : '0.1'}
	this.uniform2.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(bc2)};
	this.uniform2.color.value = ACE3.Utils.getVec3Color(c2);

	// if (this.shader == "fragmentShaderTower") {
	// 	this.texture = "media/platformBase.jpg"	
	//     this.uniform.texture1 = {type: 't', value: THREE.ImageUtils.loadTexture( this.texture )}
	// }

	if (s1 == "alphaTextureShader") {
		this.uniform.texture = {type: 't', value: THREE.ImageUtils.loadTexture( t1 )}
	}
	if (s2 == "alphaTextureShader") {
		this.uniform2.texture = {type: 't', value: THREE.ImageUtils.loadTexture( t2 )}
	}



	var g = new THREE.CubeGeometry(this.width, 0.3, this.width)

	var vertexShader = "generic"
	// materials
	var m1 = new THREE.ShaderMaterial( {
            uniforms: this.uniform,
            vertexShader: ACE3.Utils.getShader(vertexShader),
            fragmentShader: ACE3.Utils.getShader(s1),
        }); 
	var m2 = new THREE.ShaderMaterial( {
            uniforms: this.uniform2,
            vertexShader: ACE3.Utils.getShader(vertexShader),
            fragmentShader: ACE3.Utils.getShader(s2),
        }); 
	var m3 = new THREE.MeshBasicMaterial( { color: 0x0000ff }) 
	var materials = [m3, m3, m1, m2, m3, m3]
	// mesh
	smTemp = new THREE.Mesh( g, new THREE.MeshFaceMaterial( materials ) );

	var physMesh = Physijs.createMaterial(smTemp.material, 0.4, 0.6);
	return new Physijs.BoxMesh(g, physMesh, this.mass);	
}





StartTile = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, {color: 0xffff00, flippable: false, pickable: false})
	this.side = 1
}
StartTile.extends(BaseTile, "StartTile")

StartTile.prototype.defineObj = function(color, borderColor, shader) {
	color = color || 0xffff00
	borderColor = borderColor || 0xff0000
	shader = shader || "borderShader"
	this.uniform = ACE3.Utils.getStandardUniform();
	this.uniform.borderSize = { type: 'f', value: '0.1'};
	this.uniform.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(borderColor)};
	this.uniform.color.value = ACE3.Utils.getVec3Color(color);
	var g = new THREE.CubeGeometry(this.width, 0.3, this.width)
	smTemp = ACE3.Utils.getStandardShaderMesh(this.uniform, "generic", shader, g);
	var physMesh = Physijs.createMaterial(smTemp.material, 0.4, 0.6);
	return new Physijs.BoxMesh(g, physMesh, this.mass);	
}




EndTile = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, {color: 0xffff00, flippable: false, pickable: false})
	this.side = -1
}
EndTile.extends(BaseTile, "EndTile")

EndTile.prototype.defineObj = function() {
	return StartTile.prototype.defineObj.call(this, 0xffff00, 0x00ff00)
}

Tile2Go = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, {color: 0xffff00, flippable: true, pickable: true})
}
Tile2Go.extends(BaseTile, "Tile2Go")

Tile2Go.prototype.defineObj = function() {
	return Tile.prototype.defineObj.call(this, 0xff0000, 0xffffff, 0x00ffff, 0x00ffff,
		"alphaTextureShader", "borderShader", "media/Tile2Go.jpg")
}

/**
* Basic conditions for flipping, based on some other tile attributes
*/
Tile2Go.prototype.canBeFlipped = function(min, max) {
	return BaseTile.prototype.canBeFlipped.call(this, 2)
}

Tile3Go = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, {color: 0xffff00, flippable: true, pickable: true})
}
Tile3Go.extends(BaseTile, "Tile3Go")

Tile3Go.prototype.defineObj = function() {
	return Tile.prototype.defineObj.call(this, 0xff0000, 0xffffff, 0x00ffff, 0x00ffff,
		"alphaTextureShader", "borderShader", "media/Tile3Go.jpg")
}

/**
* Basic conditions for flipping, based on some other tile attributes
*/
Tile3Go.prototype.canBeFlipped = function() {
	return BaseTile.prototype.canBeFlipped.call(this, 3)
}

/**
* A tile that act on an every tile adjacent in this way:
* If the tile is enabled , it will be disabled
* If the tile is disabled, it will be enabled
*
*  This change status (enabled/disabled) and it's NOT like changing sides of tiles.
*  The side of every changed tile remains always the last set.
*/
TileSwitchStatusAround = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, { flippable: true, pickable: true})
}
TileSwitchStatusAround.extends(BaseTile, "TileSwitchStatusAround")

TileSwitchStatusAround.prototype.defineObj = function() {
	return Tile.prototype.defineObj.call(this, 0x000000, 0xffffff, 0x00ffff, 0x00ffff,
		"alphaTextureShader", "alphaTextureShader", "media/TileSwitchStatusAround.jpg", 
		"media/TileSwitchStatusAround.jpg")
}

TileSwitchStatusAround.prototype.trigger = function() {
	var ntm = this.getNearTiles()
	for (var nti in ntm) {
		ntm[nti].toggleStatus()
	}	
}

/*
TileBeam = function(mapX, mapZ) {
	BaseTile.call(this, mapX, mapZ, { flippable: false, pickable: true})
	this.orient = 0
	this.beamOn = false 
}
TileBeam.extends(BaseTile, "TileBeam")
TileBeam.prototype.defineObj = function() {
	to = StartTile.prototype.defineObj.call(this, 0xff0000, 0xffffff) 
	to.add(ACE3.Builder.cube(1, 0xff00ff))
	return to
}
TileBeam.prototype.action = function() {
	this.orient = (this.orient + 1) % 4
	this.obj.rotation.y = Math.PI * this.orient
	this.obj.__dirtyRotation = true
}
TileBeam.prototype.run = function() {
	var cntTiles = this.getNearTiles()
	if (cntTiles >= 1 && this.beamOn == false) {
		this.enableBeam()
	}else if (cntTiles >= 1 && this.beamOn == true) {
		this.disableBeam()
	}
}
TileBeam.prototype.enableBeam = function() {
	this.uniform.color.value = ACE3.Utils.getVec3Color(0x0000ff);
}
TileBeam.prototype.disableBeam = function() {
	this.uniform.color.value = ACE3.Utils.getVec3Color(0xff0000);
}
*/



















