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

StartTile.prototype.defineObj = function(color1, color2, shader) {
	color1 = color1 || 0xffff00
	color2 = color2 || 0xff0000
	shader = shader || "borderShader"
	this.uniform = ACE3.Utils.getStandardUniform();
	this.uniform.borderSize = { type: 'f', value: '0.1'};
	this.uniform.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(color2)};
	this.uniform.color.value = ACE3.Utils.getVec3Color(color1);
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


TileBeam = function(mapX, mapZ) {

	//Properties defined before calling base constructor.
	this.maxFarCells = 10 //the maximum extenc in cell units of a laser beam
	this.orient = 0

	BaseTile.call(this, mapX, mapZ, { flippable: false, pickable: true})

	this.targetOrient = 0
	this.beamOn = false 
	this.isRotating = false
	this.side =  -1
	this.pairKey = -1
	this.rotSpeed = 0.1
	this.enablingTileBeams = []
}
TileBeam.extends(BaseTile, "TileBeam")

TileBeam.prototype.defineObj = function() {
	to = StartTile.prototype.defineObj.call(this, 0xff0000, 0xffffff) 
    this.towerObj = ACE3.Builder.cylinder(0.4, 1, 0x000000, 1)
    this.towerObj.position.y = 0.5
    to.add(this.towerObj)
    this.beamObj = this.defineBeamObj()
    //this.beamObj.rotation.z = Math.PI/2
    this.beamObj.rotation.x = - Math.PI/2
    this.rebuildBeam()
    this.towerObj.add(this.beamObj)

	return to
}

TileBeam.prototype.defineBeamObj = function() {
	color = 0xffff00
	shader = "beamShader2"
	this.beamUniform = ACE3.Utils.getStandardUniform();
	this.beamUniform.color.value = ACE3.Utils.getVec3Color(color);
	this.beamLength = 1
	var g = new THREE.PlaneGeometry(this.beamLength, 3)
	var mesh = ACE3.Utils.getStandardShaderMesh(this.beamUniform, "generic", shader, g)
	mesh.material.transparent = true
	return mesh
}

TileBeam.prototype.action = function() {
	if (this.beamOn) {
		if (!this.isRotating) {
			this.targetOrient = this.orient + 1
		}
	}
}
TileBeam.prototype.run = function() {
	if (this.beamOn && !this.isRotating) {
		this.beamObj.visible = true
	} else {
		this.beamObj.visible = false // when rotating or off the beam is invisible.
	}
	var cntTiles = this.getNearTiles().length
	var paired = this.isPairedWithEnablingTiles()
	if ((cntTiles >= 1 || paired)  && !this.beamOn) {
		this.enableBeam()
	}else if ((cntTiles < 1 && !paired) && this.beamOn) {
		this.disableBeam()
	}

	if (this.orient != this.targetOrient) {
		this.rotateToTargetOrientation()
	}
	this.beamUniform.time.value = ace3.time.frameTime
}

TileBeam.prototype.rotateToTargetOrientation = function() {
	var tAngle = Math.PI / 2 * this.targetOrient
	var cAngle = this.towerObj.rotation.y
	if (tAngle <= cAngle) {
		this.orient = this.targetOrient
		this.towerObj.rotation.y = tAngle
		if (this.orient == 4) {
			this.orient = 0
			this.targetOrient = 0
			this.towerObj.rotation.y = 0
		}
		this.isRotating = false
		this.rebuildBeam()
	} else {
		this.towerObj.rotation.y += this.rotSpeed
		this.isRotating = true
	}

}

TileBeam.prototype.rebuildBeam = function() {
	var x = this.mapX
	var z = this.mapZ
	var cells = this.maxFarCells
	for (var i = 0; i < this.maxFarCells; i++) {
		if (this.orient == 0) x = x + 1
		else if (this.orient == 2) x = x - 1
		else if (this.orient == 1) z = z - 1
		else if (this.orient == 3) z = z + 1
		var c = tileMapConfig.getTile(x, z)
		if (c != null && (c.getType() == "TileBlock" || c.getType() == "TileBeam")) {
			if (c.getType() == "TileBeam") {
				c.enableBeam(this)
			}
			cells = i
			break
		}
	}
	this.beamLength = TilesConfig.size * (cells + 1)
	this.beamObj.scale.x = this.beamLength
	this.beamObj.position.x  = this.beamLength / 2
}

/**
* Enable THIS tilebeam , eventually registering the enabling tile (the enabler) in the 
* enabling array.
*/ 
TileBeam.prototype.enableBeam = function(enablingTileBeam) {
	// To avoid race condition with rebuildBeam i must return 
	// when i find an enabler i already found.
	if (enablingTileBeam) {
		if (!GameUtils.actorInArray(enablingTileBeam, this.enablingTileBeams)) {
			this.enablingTileBeams.push(enablingTileBeam)		
		}else {
			return
		}
	}
	this.uniform.color.value = ACE3.Utils.getVec3Color(0x00ff00);
	this.beamOn = true
	this.side = 1
    //TODO : Avoid race condition with rebuildBeam
	this.rebuildBeam()
}
TileBeam.prototype.disableBeam = function() {
	this.uniform.color.value = ACE3.Utils.getVec3Color(0xff0000);
	this.beamOn = false
	this.side  = -1
}

TileBeam.prototype.getPairedTile = function() {
	var pair = tileMapConfig.pairedBeams[this.pairKey]
	if (pair[0].getId() == this.getId()) {
		return pair[1]
	}else {
		return pair[0]
	}
}

/**
* It returns true if at least one ot the tiles in enablingTileBeams is 
* enabling this one. At the same time the tiles that does not enable anymore this tile
* will be stripped out from the enablingTileBeams array.
*/
TileBeam.prototype.isPairedWithEnablingTiles = function() {
	var newEnablingArray = []

	var atLeastOneEnable = false

	for (var i = 0; i < this.enablingTileBeams.length; i++) {
		var et = this.enablingTileBeams[i]
		if (et.isEnabling(this)) {
			atLeastOneEnable = true
			newEnablingArray.push(et)
			//console.log("added " + et.getType() + "[" + et.mapX + "," + et.mapZ + "]" )
		}
	}
	this.enablingTileBeams = newEnablingArray
	return atLeastOneEnable

}

/**
* Scan in the orientation of the beam if the given targetBeam is beeing enabled
* currently and the beam isn't blocked by something else.
*/
TileBeam.prototype.isEnabling = function(targetBeam) {
	if (!this.beamOn) {
		return false
	}
	var x = this.mapX
	var z = this.mapZ
	//assume the max distance between the tiles
	var dist = Math.max(Math.abs(targetBeam.mapX - this.mapX), Math.abs(targetBeam.mapZ - this.mapZ))
	for (var i = 0; i < dist + 1; i++) {
		if (this.orient == 0) x = x + 1
		else if (this.orient == 2) x = x - 1
		else if (this.orient == 1) z = z - 1
		else if (this.orient == 3) z = z + 1
		var c = tileMapConfig.getTile(x, z)
		if (c != null) {
			 var isTileBeam = (c.getType() == "TileBeam")
			 var isBlockTile = (c.getType() == "TileBlock")
			 if (isBlockTile) {
			 	return false
			 }else if (isTileBeam && c.getId() != targetBeam.getId()) {
			 	return false
			 }else if (isTileBeam && c.getId() == targetBeam.getId()) {
			 	return true
			 }
		}
	}
	return false
}





















