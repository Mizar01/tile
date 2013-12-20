// Main file for main operations, settings and all

var ace3 = null
var test_logic = null
var test_object = null
var gameManager = null // shortcut to ace3.defaultActorManager
var hudManager = null  // in game menu
var menuManager = null // shortcut to another ActorManager for menus
var upgradeManager = null //an upgrade menu during game
var buildManager = null //a build menu during game
var chooseMapMenuManager = null 

var mainThemeSound = null

var testShader = null

var optimizer = null // optimizer is a memory used throughout the entire game to store useful calculations like
                     // special sectors and other stuff in order to avoid long loops through all the objects.

// var displayInfo = null //actor that shows dynamic info on screen during game.
var player = null;

var currentPlatform = null; // the platform where the robot resides
var prevPlatform = null; // the going-away platform
var nextPlatform = null; // the coming platform 

var tileMapConfig = null

var tileEnablerManager = null

var cameraViewType = 0

Physijs.scripts.worker = 'ace3/lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';



function game_init() {
    ace3 = new ACE3(true, 1000, 500);
    ace3.setBGColor(0x000000);
    ace3.scene.setGravity(new THREE.Vector3( 0, -9.8, 0 )); 
    //ace3.addPostProcessing();
    //ace3.setFog(0.02)
    //mainThemeSound = $("#main_theme").get(0)
    //mainThemeSound.play()
    // optimizer = new Optimizer()


    gameManager = ace3.defaultActorManager
    tileEnablerManager = new TileEnablerLogic(); //optimizer and essential logic for enabling tiles.

    tileMapConfig = new TileMapConfig()
    tileMapConfig.loadMap("tunnel")

    //DISABLE DEFAULT CAMERA BEHAVIOUR
    ace3.camera.control = function() {};
    // gameManager.registerLogic(new EnemyCallLogic(0.5));
    // gameManager.registerLogic(new ESCPauseGameLogic());
    gameManager.registerLogic(new MouseControlLogic());

    gameManager.registerLogic(tileEnablerManager);

    //Adjust the pitch of the camera
    camera_reset_position()
    


    defineInGameHUD()
    // defineUpgradeManager()
    // defineBuildManager()
    defineMenuManager()


    game_play();
}

function camera_reset_position() {
    ace3.camera.cameraObj.rotation.y = 0
    ace3.camera.cameraObj.rotation.z = 0
    // ace3.camera.cameraObj.eulerOrder = "YXZ"
    // ace3.camera.cameraObj.rotation.y = - Math.PI/4 
    ace3.camera.cameraObj.rotation.x = - Math.PI/4 
    var sp = tileMapConfig.startTile.obj.position
    ace3.camera.pivot.position.set(sp.x, 20, sp.z + 15)
    ace3.camera.speed = 0.1
}

function game_change_view() {
    cameraViewType = (cameraViewType +1) % 3;
    if (cameraViewType == 0) {
        ace3.camera.pivot.position.y = 15
        ace3.camera.cameraObj.rotation.x = - Math.PI/4 
        ace3.camera.speed = 0.1
    }else if (cameraViewType == 1) {
        ace3.camera.pivot.position.y = 30
        ace3.camera.cameraObj.rotation.x = - Math.PI/4 - 0.1 
        ace3.camera.speed = 0.4
    }else if (cameraViewType == 2) {
        ace3.camera.pivot.position.y = 50
        ace3.camera.cameraObj.rotation.x = - Math.PI/4 - 0.3 
        ace3.camera.speed = 0.7
    }

}


function game_run() {
    ace3.run()
}

function game_play() {
    // upgradeManager.pause();
    // buildManager.pause();
    menuManager.pause()
    gameManager.play()
    if (hudManager) {
        hudManager.play()
    }
}

function game_pause() {
    // upgradeManager.pause();
    // buildManager.pause();
    if (hudManager) {
        hudManager.pause()
    }
    gameManager.pause()
    menuManager.play()
}

function game_upgrades() {
    if (hudManager) {
        hudManager.pause()
    }
    gameManager.pause()
    menuManager.pause()
    // buildManager.pause();
    // upgradeManager.play();

}

function game_builds() {
    if (hudManager) {
        hudManager.pause()
    }
    gameManager.pause()
    menuManager.pause()
    // upgradeManager.pause(); 
    // buildManager.play();
 
}





GameUtils = {
    getRandomHexColor: function() {
        var colors = ["ff","00","33", "a5", "88", "f0", "0f", "5a"];
        var randR = colors[THREE.Math.randInt(0,7)];
        var randG = colors[THREE.Math.randInt(0,7)];
        var randB = colors[THREE.Math.randInt(0,7)];
        return c = parseInt("0x" + randR + randG + randB);
    },
    isEnemy: function(a) {
        if (a != null && a.isEnemy) {
            return a.isEnemy
        } 
        return false
    },
    actorInArray: function(actor, actorArray) {
        for (var i in actorArray) {
            var ca = actorArray[i]
            if (ca.getId() == actor.getId()) {
                return true
            }
        }
        return false
    },
    valueInList: function(val, list) {
        for (i in list) {
            if (list[i] == val) {
                return true
            }
        }
        return false
    },
}


// TODO : add to the ace3 source code !!!!

ACE3.Test = []

ACE3.Test.makeTestCube = function(position, color){
    var color = color || 0xffffff
    var obj = ACE3.Builder.cube(1, color)
    obj.position = position
    _ace3.scene.add(obj)

    return obj
}

/**
* Gets a random object from an associative array.
* TODO : it's not very performant. It scans always the entire array.
* You can specify a filter property to exclude from the choosing some other objects.
*/
ACE3.Math.getRandomObject = function(assocArr, filterProp, filterValue) {
    var limit = -1 || limit
    var ret;
    var c = 0;
    var prop = filterProp || null 
    var val = filterValue || null
    //boolean
    if (val == "true") {
        val = true
    }else if (val == "false") {
        val = false
    }
    for (var key in assocArr) {
        // console.log("assocArray["+ key+ "]["+ prop +"]")
        if ((prop != null && val != null && assocArr[key][prop] == val) ||
             prop == null) {
            c++ //the increment is done only if the properties are right.
            if (Math.random() < 1/c)     //this is the secret formula.
               ret = key;
       }
    }
    return assocArr[ret];
}

/**
* Get the angle between the projection of two 3d points in the xz plane.
* It gives the y angle formed by the direction vector between two points.
* The angle is between -PI and PI.
*/
ACE3.Math.getXZAngle = function(p1, p2) {
    // console.log("getXZAngle")
    var xd = p2.x - p1.x
    var zd = p2.z - p1.z
    var res = Math.atan2(-zd, xd)   //The minus is necessary because z axis is reversed.
    // console.log(p1)
    // console.log(p2)
    // console.log("angle:" + res)
    return res
}


/**
* Return the angle normalized between -PI and PI
*/
ACE3.Math.getNormalizedAngle = function(angle) {
    var m = angle % (Math.PI * 2)
    if (m > 0 && m > Math.PI) {
        m -= Math.PI * 2
    }else if (m < 0 && m < -Math.PI) {
        m += Math.PI * 2
    }
    return m

}

/**
* get the angle between the distance vector and the xz plane.
* It gives the pitch of the point p1 while looking at p2.
* The angle is between -PI and PI.
*/
ACE3.Math.getPitchAngle = function(p1, p2) {
    var yd = p2.y - p1.y
    var xzd = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2))
    return Math.atan2(yd, xzd)
}

/**
* Returns -1, 0 or 1 (clockwise)
* The angles must be -PI / PI
**/
ACE3.Math.getAngleDirection = function(a1, a2) {
    // console.log("getAngleDirection")
    //normalize
    a1 = ACE3.Math.getNormalizedAngle(a1)
    a2 = ACE3.Math.getNormalizedAngle(a2)
    var pi = Math.PI
    var d = Math.abs(a2 - a1)
    var diff = a2 - a1
    // console.log("a1:" + a1 + " --- a2:" + a2)
    // console.log("d:" + d + "--- diff:" + diff)
    if (d == 0 || d == Math.PI * 2) {
        // console.log("returning 0")
        return 0
    }else if ((diff > 0 && d > pi) || (diff < 0 && d < pi)) {
        // console.log("returning -1")
        return -1
    }else {
        // console.log("returning 1")
        return 1
    }

}


ACE3.Actor3D.prototype.getYaw = function(vec3Target) {
    return ACE3.Math.getXZAngle(this.getWorldCoords(), vec3Target)
}

ACE3.Actor3D.prototype.getPitch = function(vec3Target) {
    return ACE3.Math.getPitchAngle(this.getWorldCoords(), vec3Target)
}

/**
* Non extendable static function
**/
ACE3.Actor.isAlive = function(actor) {
    return actor != null && actor.alive 
}

/**
* Improved version of __run managing dead children
*/
ACE3.Actor.prototype.__run = function() {
    if (this.alive) {
        this.run()
        for (id in this.actorChildren) {
            var c = this.actorChildren[id]
            if (c.alive) {
                this.actorChildren[id].__run()
            }else {
                this.removeActor(c)
            }
        }
    }      
}

/**
* removes from the scene or the direct parent
*/
ACE3.Actor3D.prototype.removeFromScene = function () {
    // console.log("removeFromScene:")
    // console.log(this.obj.parent)
    var parent = this.obj.parent
    parent.remove(this.obj)
}

/**
* Default beahaviour for removeSelf()
* The remove() method should be called by manager
* You can overwrite this method.
* NOTE: Replaces the Actor.remove method.
*/
ACE3.Actor3D.prototype.removeSelf = function() {
    // console.log("removeSelf:")
    // console.log(this.obj.parent)
    this.removeFromScene()
    this.alive = false
    if (this.pickable) {
        _ace3.pickManager.removeActor(this)
    }
}

/**
* Default beahaviour for removeSelf()
* The remove() method should be called by manager
* You can overwrite this method.
* NOTE: Replaces the Actor.remove method.
*/
ACE3.Actor.removeSelf = function() {}

/**
* New version of removeActor
*/ 
ACE3.Actor.removeActor = function(actor) {
    actor.removeSelf()
    actor.parentActor = null
    delete this.actorChildren["" + actor.getId()]
}