Item = function(tile, bonusType, bonusSize) {
    ACE3.Actor3D.call(this)
    
    this.itemColor = TilesConfig.bonusColors[TilesConfig.bonusTypes.indexOf(bonusType)]
    
    this.obj = ACE3.Builder.cube2(1.5,1.5,0.2, ACE3.Utils.getHexColor(this.itemColor))
    this.bonusType = bonusType
    this.bonusSize = bonusSize
    this.obj.position = tile.obj.position.clone()
    this.obj.position.y += 2
    this.referencePosY = this.obj.position.y
    
    this.animTimer = new ACE3.CooldownTimer(Math.PI * 2, true)
    

}
Item.extends(ACE3.Actor3D, "Item")

Item.prototype.run = function() {
    
    this.animTimer.trigger()
    this.obj.rotation.y += 0.1
    this.obj.position.y = this.referencePosY + 0.5 * Math.sin(this.animTimer.time * 4)
}

Item.prototype.pick = function() {
    
    player[this.bonusType] += this.bonusSize
    this.setForRemoval()
}





