
ESCPauseGameLogic = function() {
    ACE3.Logic.call(this);
}
ESCPauseGameLogic.prototype.run = function() {
    if (ace3.eventManager.released(ace3.eventManager.keyCodes.escape)) {
        game_pause()
    }		
}

EnemyCallLogic = function(timeRate) {
    ACE3.Logic.call(this);
    this.timeRate = timeRate || 5
    this.spawnTimer = new ACE3.CooldownTimer(timeRate, true)
    this.spawnTimer.time = 0.01 //make the first spawn instantly
    this.enemyArray = ["Bird", "Cube"]
}
EnemyCallLogic.prototype.run = function() {
    var rand = Math.round(Math.random())
    if (this.spawnTimer.trigger()) {
        var b = new window[this.enemyArray[rand]]();
        b.setPickable();
        gameManager.registerActor(b);
    } 
}

MouseControlLogic = function() {
    ACE3.Logic.call(this);
    this.dragLogic = new MouseDragCameraLogic()
    this.clickLogic = new MouseClickTileLogic()
}

MouseControlLogic.prototype.run = function() {
    if (!this.dragLogic.isDragging) {
        this.clickLogic.run()
    }
    this.dragLogic.run()
}

//sub logics about dragging
MouseDragCameraLogic = function() {
    this.phase = "released"  //released, pressed
    this.lastMousePos = ace3.getViewportMousePosition()
    this.zSpeed = 3
    this.xSpeed = 6
    this.sensibility = 0.002
    this.isDragging = false
}


MouseDragCameraLogic.prototype.run = function() {
    if (ace3.eventManager.mousePressed()) {
        var mp = ace3.getViewportMousePosition()
        if (this.phase == 'released') {
            this.phase = 'pressed'
            this.lastMousePos = mp
        }else {
            var diff = {x: this.lastMousePos.x - mp.x, y: this.lastMousePos.y - mp.y}
            if (this.isDragging || diff.x >= this.sensibility || diff.y >= this.sensibility) {
                ace3.camera.pivot.position.x += diff.x * this.xSpeed
                ace3.camera.pivot.position.z -= diff.y * this.zSpeed
                this.lastMousePos = mp
                this.isDragging = true
            }           
        }
    } else {
        this.phase = "released"
        this.isDragging = false
    }
}

//sub logics about clicking
MouseClickTileLogic = function() {
    this.pressPos = null
    this.clickThreshold = 0.001
}

MouseClickTileLogic.prototype.run = function() {
    if (ace3.eventManager.mousePressed()) {
        this.pressPos = ace3.getViewportMousePosition()
    }
    if (ace3.eventManager.mouseReleased()) {
        var mp = ace3.getViewportMousePosition()
        if (Math.abs(mp.x - this.pressPos.x) < this.clickThreshold && Math.abs(mp.y - this.pressPos.y) < this.clickThreshold) {
            //I will consider it a click.
            var pm = ace3.pickManager
            pm.pickActor()
            var p = pm.pickedActor

            if (p != null) {
                var pt = p.getType()
                if (pt == 'Tile' || pt == 'StartTile') {
                    p.flip()
                }
            }
        }
        //anyway i reset everything
        this.pressPos == null
    }
}




