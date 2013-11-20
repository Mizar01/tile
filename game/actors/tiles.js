Tile = function(vec3pos, mapX, mapZ, width, color, mass) {
	ACE3.Actor3D.call(this);
	this.mass = mass || 0;
	this.width = width;
	this.color = color;
	this.mapX = mapX
	this.mapZ = mapZ
	this.shader = "borderShader"
	// this.shader = shader || "fragmentShaderTower";

	this.uniform = ACE3.Utils.getStandardUniform();
	this.uniform.borderSize = { type: 'f', value: '0.1'};
	this.uniform.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(0xffffff)};
	this.uniform.color.value = ACE3.Utils.getVec3Color(color);

	this.uniform2 = ACE3.Utils.getStandardUniform();
	this.uniform2.borderSize = { type: 'f', value : '0.1'}
	this.uniform2.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(0x00ff00)};
	this.uniform2.color.value = ACE3.Utils.getVec3Color(0xffffff);

	// if (this.shader == "fragmentShaderTower") {
	// 	this.texture = "media/platformBase.jpg"	
	//     this.uniform.texture1 = {type: 't', value: THREE.ImageUtils.loadTexture( this.texture )}
	// }
	var g = new THREE.CubeGeometry(width, 0.3, width)

	var vertexShader = "generic"
	// materials
	var m1 = new THREE.ShaderMaterial( {
            uniforms: this.uniform,
            vertexShader: ACE3.Utils.getShader(vertexShader),
            fragmentShader: ACE3.Utils.getShader(this.shader),
        }); 
	var m2 = new THREE.ShaderMaterial( {
            uniforms: this.uniform2,
            vertexShader: ACE3.Utils.getShader(vertexShader),
            fragmentShader: ACE3.Utils.getShader(this.shader),
        }); 
	var m3 = new THREE.MeshBasicMaterial( { color: 0x0000ff }) 
	var materials = [m3, m3, m1, m2, m3, m3]
	// mesh
	smTemp = new THREE.Mesh( g, new THREE.MeshFaceMaterial( materials ) );



	var physMesh = Physijs.createMaterial(smTemp.material, 0.4, 0.6);
	this.obj = new Physijs.BoxMesh(g, physMesh, this.mass);

	this.obj.position = new THREE.Vector3(vec3pos.x, vec3pos.y, vec3pos.z); 

	this.isFlipping = false
	this.side = -1   // -1 , 1  //the side reached AT THE END OF FLIPPING

	this.flipSpeed = 0.12
}

Tile.extends(ACE3.Actor3D, "Tile");

Tile.prototype.run = function() {
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

Tile.prototype.flip = function() {
	if (!this.isFlipping) {
		if (this.canBeFlipped()) {
			this.isFlipping = true
		}
	}
}

/**
* it returns the current side of the tile if it's still , or the 
* side where the tile will be at the end of the flipping 
*/
Tile.prototype.getFlipSide = function() {
	if (this.isFlipping) {
		return -1 * this.side
	}else {
		return this.side
	}
}

/**
* Basic conditions for flipping, based on some other tile attributes
*/
Tile.prototype.canBeFlipped = function() {
	var ntm = this.getNearTiles()
	for (var nti in ntm) {
		if (ntm[nti].getFlipSide() == 1) {
			return true
		}
	}
	return false
}

Tile.prototype.getNearTiles = function() {
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
		var t = GameUtils.getTile(pairVer[i][0], pairVer[i][1])
		if (t != null) {
			ntm.push(t)
		}
	}
	return ntm
}





StartTile = function(vec3pos, mapX, mapZ, width, color, mass, shader) {
	Tile.call(this, vec3pos, mapX, mapZ, width, color, mass, shader)
	this.side = 1
}
StartTile.extends(Tile, "StartTile")

StartTile.prototype.flip = function() {
	console.log("You cannot flip a starting Tile")
}







