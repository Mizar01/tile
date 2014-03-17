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

  
    this.life = 10
    this.defense = []
    this.defense.light = -1
    this.defense.shadow = -1
    this.defense.fear = -1
    this.defense.blood = -1
    this.attack = 3
    this.energy = 100
        
    this.special = null // special is an array of functions that only some units have.
    this.specialDescription = null
    
    this.randomizeDefense()


}
TileUnit.extends(BaseTile, "TileUnit")

TileUnit.prototype.defineObj = function() {
 
    to = StartTile.prototype.defineObj.call(this, this.colorDefault, 0x000001)
    this.unitObj = this.defineUnitObj()
    this.unitObj.position.y = this.width / 2
    to.add(this.unitObj)
    return to
}

TileUnit.prototype.defineUnitObj = function() {
    
    //var color = ACE3.Utils.getRandomColor()
    //var body = ACE3.Builder.cube2(this.width / 2, this.width, this.width / 2, color)
    
    var body = new THREE.Object3D()
    ACE3.Utils.addModel(body, "fighter2", new THREE.Vector3(0.4, 0.4, 0.4), new THREE.Vector3(0, 0.5, 0))
    body.rotation.y = -Math.PI
    return body
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

/**
 * Main alghorithm to determine the probability to win for a player
 * against this unit.
 */
TileUnit.prototype.getChanceToWin = function() {
    
    prob = 0
    
    // PHASE 1 : calculation based on item comparisons
    for (var item in this.defense) {
        var sp = player[item]
        var su = this.defense[item]
        if (su != -1) {
            if (su == 0) {
                su = 1
            }
            var prob = prob + parseInt( sp * 50 / su)
        }
    }
    
    // PHASE 2 : add a percentage for each flipped tile near the unit
    // TODO
    
    return Math.min(100, prob)
    
}

TileUnit.prototype.buildInfoText = function() {
    var br = "<br/>"
    return  "<div style='padding:10px; font-size:0.7em; font-family: Courier;';>" +
                "<b>" + this.name + "</b><br/>" +
                "ATT " + this.attack + " DEF " + this.buildPropsString(this.defense) + br + 
                "Life " + this.life + " Energy " + this.energy + br +
                "Chance to win : " + this.getChanceToWin() + br +
                "Tap again to attack" +
            "</div>"
}


TileUnit.prototype.buildPropsString = function(props) {
    return this.formatPropValue("L", props.light) + 
           this.formatPropValue("S", props.shadow) + 
           this.formatPropValue("B", props.blood) +
           this.formatPropValue("F", props.fear)
}

/**
 * 100 means absolute. So it'll be rendered with a dash '-'
 * Anything else will be padded so to fill 4 columns
 */
TileUnit.prototype.formatPropValue = function(label, value) {
    if (value == -1) {
        return " "
    }else {
        if (value < 10) {
            return label + "  " + value + " "
        }else {
            return label + " " + value + " "
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

TileUnit.prototype.randomizeDefense = function() {
    defItems = ["light", "shadow", "blood", "fear"]
    for (var i = 0; i < 2; i++) {
        this.defense[ACE3.Utils.arrayRandVal(defItems)] = THREE.Math.randInt(1, 5)
    }
}

TileUnit.prototype.getDamage = function() {
    this.life -= player.attack
    if (this.life <= 0) {
        this.destroyUnit()
    }
}