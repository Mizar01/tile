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
    tileMapConfig.loadMap("Corona")

    player = new Player()

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


/* Add this to ACE3 code */
ACE3.prototype.getSizeFromRatio = function(percX, percY) {
    var x = this.vpSize.x/100 * percX
    var y = this.vpSize.y/100 * percY
    return new THREE.Vector2(x, y)
}









