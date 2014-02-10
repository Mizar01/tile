Item = function(tile, bonusType, bonusSize) {
    ACE3.Actor3D.call(this)
    this.obj = ACE3.Builder.cube2(1.5,1.5,0.3, 0xff00ff)
    this.bonusType = bonusType
    this.bonusSize = bonusSize
    this.obj.position = tile.obj.position.clone()
    this.obj.position.y += 2
    

}
Item.extends(ACE3.Actor3D, "Item")

Item.prototype.run = function() {
    this.obj.rotation.y += 0.1
}





