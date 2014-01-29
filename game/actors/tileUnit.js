TileUnit = function(mapX, mapZ) {
    this.unitObj = null

    this.colorAlive = 0x999999
    this.colorSelected = 0x00BB00
    this.colorDefeated = 0xEEEEEE
    this.colorDefault = this.colorAlive
    
    this.name = GameUtils.generateUnitName()

    BaseTile.call(this, mapX, mapZ, {flippable: false, pickable: true, blocking : true, })   
    this.side = -1
    this.enemy = true
    this.selected = false
    this.taps = 0

    this.unitProps = this.buildUnitProps()
    
    var pos = ace3.getFromRatio(80, 80)
    var size = ace3.getSizeFromRatio(20, 20)
    this.info = new ACE3.HTMLBox(this.getId(), "Hello, Tap to attack !",
                    pos.x, pos.y, size.x, size.y, 10)
    gameManager.registerActor(this.info)
    this.info.hide()


}
TileUnit.extends(BaseTile, "TileUnit")

TileUnit.prototype.defineObj = function() {
 
    to = StartTile.prototype.defineObj.call(this, this.colorDefault, 0x000001)
    this.unitObj = ACE3.Builder.cube2(this.width / 2, this.width, this.width / 2, 0xAA0066)
    this.unitObj.position.y = this.width / 2
    to.add(this.unitObj)
    return to
}

TileUnit.prototype.select = function() {
    this.taps = 1
    this.selected = 1
    this.uniform.color.value = ACE3.Utils.getVec3Color(this.colorSelected);
}

TileUnit.prototype.unselect = function() {
    this.taps = 0
    this.selected = false
    this.uniform.color.value = ACE3.Utils.getVec3Color(this.colorDefault);
    this.info.hide()
}

TileUnit.prototype.action = function() {
	if (this.enabled) {
        if (this.side == -1) {
            if (this.taps == 1) {
                this.info.updateText(this.buildInfoText());
                this.info.show()
                
            }else if (this.taps >= 2) {
                //this.info.hide()
                player.challenge(this)
                this.info.updateText(this.buildInfoText())
            }
            this.taps++
        }
	}
}

TileUnit.prototype.buildInfoText = function() {
    return  "<div style='padding:10px';>" +
                "<b>" + this.name + "</b><br/>" +
                "Energy : " + this.unitProps.energy + "<br/>" + "Tap again to attack" +
            "</div>"
}



TileUnit.prototype.destroyUnit = function() {
    this.tileObj.remove(this.unitObj)
    this.side = 1
    this.colorDefault = this.colorDefeated
    this.props["blocking"] = false
    this.unselect()
}

TileUnit.prototype.buildUnitProps = function(energy, vArray, rArray, miscArray) {
    v = []
    v.energy = energy || (50 + Math.round(Math.random() * 200))
    if (vArray == null) {
        v.cons = new Array()
    }else {
        v.cons = vArray
    }
    if (rArray == null) {
        v.resistant = new Array()
    }else {
        v.resistant = rArray
    }
    if (miscArray == null) {
        v.misc = new Array()
    }else {
        v.misc = miscArray
    }
    return v
}