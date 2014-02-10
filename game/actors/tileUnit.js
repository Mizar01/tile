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

  
    this.life = 100
    this.defense = []
    this.defense.light = 100
    this.defense.shadow = 100
    this.defense.fear = 100
    this.defense.blood = 100
    this.attack = []
    this.attack.light = 10
    this.attack.fear = 10
    this.attack.blood = 10
    this.attack.shadow = 10 
    this.energy = 100
        
    this.specialBehaviour = null // special is a function that only some units have.
    this.specialDescription = null


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
    unitInfoBox.hide()
}

TileUnit.prototype.action = function() {
	if (this.enabled) {
        if (this.side == -1) {
            if (this.taps == 1) {
                unitInfoBox.updateText(this.buildInfoText());
                unitInfoBox.show()
                
            }else if (this.taps >= 2) {
                //this.info.hide()
                player.challenge(this)
                unitInfoBox.updateText(this.buildInfoText())
            }
            this.taps++
        }
	}
}

TileUnit.prototype.buildInfoText = function() {
    var br = "<br/>"
    return  "<div style='padding:10px; font-size:0.7em; font-family: Courier;';>" +
                "<b>" + this.name + "</b><br/>" +
                "Attack : " + this.buildPropsString(this.attack) + br +
                "Defense: " + this.buildPropsString(this.defense) + br + 
                "Life   : " + this.life + br + 
                "Energy : " + this.energy + br +
                "Tap again to attack" +
            "</div>"
}

TileUnit.prototype.buildPropsString = function(props) {
    return "L" + this.formatPropValue(props.light) + 
           "S" + this.formatPropValue(props.shadow) + 
           "B" + this.formatPropValue(props.blood) +
           "F" + this.formatPropValue(props.fear)
}

/**
 * 100 means absolute. So it'll be rendered with a dash '-'
 * Anything else will be padded so to fill 4 columns
 */
TileUnit.prototype.formatPropValue = function(value) {
    if (value >= 100) {
        return " -- "
    }else {
        if (value < 10) {
            return "  " + value + " "
        }else {
            return " " + value + " "
        }
    }
}



TileUnit.prototype.destroyUnit = function() {
    this.tileObj.remove(this.unitObj)
    this.side = 1
    this.colorDefault = this.colorDefeated
    this.props["blocking"] = false
    this.unselect()
}