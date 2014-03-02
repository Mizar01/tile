Item = function(tile, bonusType, bonusSize) {
    ACE3.Actor3D.call(this)
    
    
    this.itemConfigIndex = TilesConfig.bonusTypes.indexOf(bonusType)
    
    this.itemColor = TilesConfig.bonusColors[this.itemConfigIndex]
    
    //this.obj = ACE3.Builder.cube2(1.5,1.5,0.2, ACE3.Utils.getHexColor(this.itemColor))
    this.bonusType = bonusType
    this.bonusSize = bonusSize
    
    this.obj = this.defineObj()
    
    this.obj.position = tile.obj.position.clone()
    this.obj.position.y += 2
    this.referencePosY = this.obj.position.y
    
    this.animTimer = new ACE3.CooldownTimer(Math.PI * 2, true)
    

}
Item.extends(ACE3.Actor3D, "Item")

Item.prototype.run = function() {
    
    this.animTimer.trigger()
    this.obj.rotation.y += 0.03
    this.obj.position.y = this.referencePosY + 0.5 * Math.sin(this.animTimer.time * 4)
}

Item.prototype.pick = function() {
    
    player[this.bonusType] += this.bonusSize
    this.setForRemoval()
}

Item.prototype.defineObj = function() {
    
    var c1 = 0xffffff
	var bc1 = 0x0000ff
	var s1 = "alphaTextureShader"
	var t1 = TilesConfig.bonusTextures[this.itemConfigIndex]

	this.uniform = ACE3.Utils.getStandardUniform();
	//this.uniform.borderSize = { type: 'f', value: '0.1'};
	//this.uniform.borderColor = {type: 'v3', value: ACE3.Utils.getVec3Color(bc1)};
	this.uniform.color.value = ACE3.Utils.getVec3Color(c1);


	if (s1 == "alphaTextureShader") {
		this.uniform.texture = {type: 't', value: THREE.ImageUtils.loadTexture( t1 )}
	}
	var g = new THREE.CubeGeometry(1.5, 1.5, 0.1)

	var vertexShader = "generic"
	// materials
	var m1 = new THREE.ShaderMaterial( {
            uniforms: this.uniform,
            vertexShader: ACE3.Utils.getShader(vertexShader),
            fragmentShader: ACE3.Utils.getShader(s1),
        }); 
	var m3 = new THREE.MeshBasicMaterial( { color: 0xffffff }) 
	var materials = [m3, m3, m3, m3, m1, m1]
	// mesh
	smTemp = new THREE.Mesh( g, new THREE.MeshFaceMaterial( materials ) )

	//var physMesh = Physijs.createMaterial(smTemp.material, 0.4, 0.6);
	//return new Physijs.BoxMesh(g, physMesh, this.mass);
    
    return smTemp
  
}





