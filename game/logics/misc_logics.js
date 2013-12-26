
ESCPauseGameLogic = function() {
    ACE3.Logic.call(this);
}
ESCPauseGameLogic.prototype.run = function() {
    if (ace3.eventManager.released(ace3.eventManager.keyCodes.escape)) {
        game_pause()
    }		
}

//EnemyCallLogic = function(timeRate) {
//    ACE3.Logic.call(this);
//    this.timeRate = timeRate || 5
//    this.spawnTimer = new ACE3.CooldownTimer(timeRate, true)
//    this.spawnTimer.time = 0.01 //make the first spawn instantly
//    this.enemyArray = ["Bird", "Cube"]
//}
//EnemyCallLogic.prototype.run = function() {
//    var rand = Math.round(Math.random())
//    if (this.spawnTimer.trigger()) {
//        var b = new window[this.enemyArray[rand]]();
//        b.setPickable();
//        gameManager.registerActor(b);
//    } 
//}

MouseControlLogic = function() {
    ACE3.Logic.call(this);
    this.pressedStart = false;
    this.startMP = {}
    this.lastMP = ace3.getViewportMousePosition()
    this.endMP = {}
    this.zSpeed = 60
    this.xSpeed = 120
    this.sensibility = 0.001


    this.clickThreshold = 0.03

    // this.dragLogic = new MouseDragCameraLogic()
    // this.clickLogic = new MouseClickTileLogic()
}

MouseControlLogic.prototype.run = function() {
    //if (!this.dragLogic.isDragging) {
    //    this.clickLogic.run()
    //}
    //this.dragLogic.run()
    var cmp = ace3.getViewportMousePosition()
    var selectedUnit = null

    if (ace3.eventManager.mousePressed()) {
        if (!this.pressedStart) {
            this.pressedStart = true
            this.startMP = {"x": cmp.x, "y": cmp.y}
            this.lastMP = {"x": cmp.x, "y": cmp.y}
        }else {
            var diff = {x: this.lastMP.x - cmp.x, y: this.lastMP.y - cmp.y}
            if (Math.abs(diff.x) >= this.sensibility || Math.abs(diff.y) >= this.sensibility) {
                ace3.camera.pivot.position.x += diff.x * this.xSpeed * ace3.camera.speed
                ace3.camera.pivot.position.z -= diff.y * this.zSpeed * ace3.camera.speed 
                this.lastMP = cmp
            }
        }
    }
    if (ace3.eventManager.mouseReleased()) {
        if (Math.abs(cmp.x - this.startMP.x) < this.clickThreshold && 
            Math.abs(cmp.y - this.startMP.y) < this.clickThreshold) {
            //select/clic/tap
            var pm = ace3.pickManager
            pm.pickActor()
            var p = pm.pickedActor
            if (p != null) {
                var pt = p.getType()
                //Unselect eventual previous selected tileUnit
                if (this.selectedUnit != null && this.selectedUnit.getId() != p.getId()) {
                    this.selectedUnit.unselect()
                    this.selectedUnit = null
                }
                //first selection of a tileUnit
                if (pt == "TileUnit") {
                    
                    if (this.selectedUnit == null) {
                        this.selectedUnit = p
                        p.select()
                    }
                }
             
                if (p.action) {
                    p.action()
                }
            }
        }
        this.pressedStart = false        
    }
}

/**
* Logic that manage and optimize the enabling logic of some dynamic and automatic tiles/components.
* The logic store an enabledArray of Tiles or components and this is destroyed after beiing processed.
* The level of enabling is an increasing value from 0 to N  (0 means not to be enabled)
*/
TileEnablerLogic = function() {
    this.enablingConditions = {}
    this.frameCount = 0
}

TileEnablerLogic.prototype.registerTile = function(actor) {
    this.enablingConditions[actor.getId()] = 0
}

TileEnablerLogic.prototype.run = function() {
    this.frameCount++

    // console.log(this.frameCount + "RUN")
    // console.log(this.enablingConditions)
    for (var i in this.enablingConditions) {
        var cv = this.enablingConditions[i]
        var actor = gameManager.findActorById(i)
        if (cv > 0) {
            // console.log("enabled " + i)
            actor.enableTile()
        }else {
            // console.log("disabled " + i)
            actor.disableTile()
        }
        //resetting conditions.
        this.enablingConditions["" + i] = 0
    }
    // console.log(this.enablingConditions)
}

TileEnablerLogic.prototype.addEnablingCondition = function(actor) {

    // console.log(this.frameCount + "AEC")
    var cv = this.enablingConditions["" + actor.getId()]
    // console.log("cv " + cv)
    if (!cv && cv != 0) {
        return
    }
    this.enablingConditions["" + actor.getId()]++
    // console.log(this.enablingConditions)
}

// TileEnablerLogic.prototype.removeEnablingCondition = function(actor) {
//     var cv = this.enabledArray[actor.getId()] || 1
//     this.enabledArray[actor.getId()] = cv + 1
// }

TileEnablerLogic.prototype.clean = function() {
    this.enabledArray = {}
}






