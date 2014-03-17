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

var testObj = null

var optimizer = null // optimizer is a memory used throughout the entire game to store useful calculations like
                     // special sectors and other stuff in order to avoid long loops through all the objects.

// var displayInfo = null //actor that shows dynamic info on screen during game.
var player = null;

var currentPlatform = null; // the platform where the robot resides
var prevPlatform = null; // the going-away platform
var nextPlatform = null; // the coming platform 

var tileMapConfig = null

var tileEnablerManager = null

var unitInfoBox = null

var cameraViewType = 0

Physijs.scripts.worker = 'ace3/lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';




//function game_init() {
//    ace3 = new ACE3(false, 1000, 500)
//    ace3.setBGColor(0xffffff)
//    gameManager = ace3.defaultActorManager
//    var a = ACE3.TestUtils.makeTestCube(new THREE.Vector3(0, 0, 0), 0xff0000)
//    ace3.camera.cameraObj.rotation.x = -Math.PI / 4
//    ace3.camera.pivot.position.set(0, 5, 8)
//    ace3.camera.speed = 0.1
//    ace3.defaultActorManager.play()
//}



function game_init() {
    ace3 = new ACE3(true, 1000, 500);
    //ace3.setBGColor(0x000000);
    ace3.setBGColor(0xffffff)
    ace3.scene.setGravity(new THREE.Vector3( 0, -9.8, 0 ));
    ace3.scene.add( new THREE.AmbientLight( 0xffffff ) );
    //ace3.addPostProcessing();
    //ace3.setFog(0.02)
    //mainThemeSound = $("#main_theme").get(0)
    //mainThemeSound.play()
    // optimizer = new Optimizer()


    gameManager = ace3.defaultActorManager
    tileEnablerManager = new TileEnablerLogic(); //optimizer and essential logic for enabling tiles.

    tileMapConfig = new TileMapConfig()
    //tileMapConfig.buildRandomMap2(20, 20)
    tileMapConfig.loadMap("Corona")

    player = new Player()

    //DISABLE DEFAULT CAMERA BEHAVIOUR
    ace3.camera.control = function() {};
    // gameManager.registerLogic(new EnemyCallLogic(0.5));
    // gameManager.registerLogic(new ESCPauseGameLogic());
    gameManager.registerLogic(new MouseControlLogic());

    gameManager.registerLogic(tileEnablerManager);
    gameManager.registerLogic(new BonusRandomGenerator())

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
    generateUnitName: function() {
        var arv = ACE3.Utils.arrayRandVal
        var nameTypes = ["single", "singleComposite", "double"] //, "doubleOf", "double"]
        var nameSet = ["Bob"]
        var singleNames = [ "Alice", "Sharko", "Raxud", "Felix", "Mikil", "Traster", "Cadmon" ]
        var rType = arv(nameTypes)
        if (rType == "single") {
            return  arv(singleNames)
        }else if (rType == "singleComposite") {
            var c1 = [ "Sin", "At", "Kin", "Rat", "Rak", "Malu", "Nor", "Sur", "Ko", "Tra", "it", "Fla", "Kne",
                       "Kar", "Ott", "Num", "Sta", "Kla", "Nin"]
            var c2 = [ "-", "Nu", "", "Go", "De", "En", "In", "Alu", "Gre" ]
            return arv(c1) + arv(c2) +
                      arv(c1) + arv(c2) + arv(c1)
        }else if (rType == "double") {
            return arv(singleNames) + " " + arv(singleNames)
        }
    },
}


/* Add this to ACE3 code */
ACE3.prototype.getSizeFromRatio = function(percX, percY) {
    var x = this.vpSize.x/100 * percX
    var y = this.vpSize.y/100 * percY
    return new THREE.Vector2(x, y)
}

/**
 * Rebuilds the content based on new set properties             
 */ 
ACE3.ActorHTML.prototype.updateText = function(text) {
    $("#" + this.id).html(text)
    this.label = text
    this.content = this.buildContent() // this is only to store the new content in the object, not useful right now.
}

ACE3.Utils.arrayRandVal = function(arr) {
    var l = arr.length - 1
    var rn = parseInt(Math.round(Math.random() * l))
    //console.log(rn)
    return arr[rn]
}

ACE3.Utils.colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

/*
 *  Get a string hexadecimal representation of a named color
 */
ACE3.Utils.getHexColor = function (colorName) {
    return parseInt("0x" + ACE3.Utils.colors[colorName].substring(1))
}

/**
 * Return a random color code between 0x000000 and 0xffffff
 *
 * The number can be represented in decimals.
 */
ACE3.Utils.getRandomColor = function() {
    v = Math.floor(Math.random() * 16777216)
    return v
}

//  REWRITE OF ACE3.DisplayValue
/**
 * shows an html div positioned on top,left coords of screen for now
 * TODO : give the coords from the viewport screen.
 */
ACE3.DisplayValue = function(label, defaultValue, vec2pos, valuePos) {
    ACE3.ActorHTML.call(this)
    this.obj = null
    this.div = null
    this.label = label  // label can be html code
    this.defaultValue = defaultValue
    this.labelId = null //html id of the element
    this.valueId = null //html id of the element
    this.value = defaultValue
    this.pos = vec2pos
    this.separator = ": "
    this.valueFunction = null
    
    this.valuePos = valuePos || "right"  //the position of the value relative to the label.
                                         //accepted values = "right", "south"

    this.baseCss = {
       position: "fixed",
       top: this.pos.y + "px",
       left: this.pos.x + "px",
       /*height: this.height + "px",*/
       /*width: this.width + "px",*/
       zIndex: 10,
       backgroundColor: "gold",
       color: "black",
       borderRadius: "3px",
    }

}

ACE3.DisplayValue.extends(ACE3.ActorHTML, "ACE3.DisplayValue")
    
ACE3.DisplayValue.prototype.buildContent = function() {
    this.labelId = "display_value_actor_label" + this.id
    this.valueId = "display_value_actor_value" + this.id
    var spanLabel = "<span id='" + this.labelId + "'>" + this.label + "</span>"
    var spanValue = "<span id='" + this.valueId + "'>" + this.value + "</span>"
    if (this.valuePos == "south") {
        return "<div id='" + this.getId() + "'><div>" + spanLabel + "</div><div>" + spanValue + "</div></div>"
    }
    return "<div id='" + this.getId() + "'>" + spanLabel + this.separator + spanValue + "</div>"
}
    
ACE3.DisplayValue.prototype.setValue = function(value) {
    if (this.value != value) {
        this.value = value
        $("#" + this.valueId).html(value)
    }
}

ACE3.DisplayValue.prototype.run = function() {
  if (this.valueFunction != null) {
      this.setValue(this.valueFunction())
  }
}

/**
 * Automatically load and add a json model to the pivot
 *
 * TODO: the path is fixed, so other params, they should be changeable.
 *
 */
ACE3.Utils.addModel = function(pivotObj, model, scaleV, posV) {
    
    var loader = new THREE.JSONLoader()
    loader.load("/webgl/3d_models/" + model + ".js", function(g, m) {
        if (g instanceof THREE.Geometry) {
            g.computeVertexNormals()
            var mesh = new THREE.Mesh(g, new THREE.MeshFaceMaterial(m))
            mesh.scale.copy(scaleV)
            mesh.position = posV
            pivotObj.add(mesh)
        }   
        })
    this.obj = null   
}



TestActor = function(px, py, pz, scale, model) {
	ACE3.Actor3D.call(this);
    var that = this
    this.scale = new THREE.Vector3(scale, scale, scale)
    var loader = new THREE.JSONLoader()
    this.objStartPos = new THREE.Vector3(px, py, pz)
    loader.load("/webgl/3d_models/" + model + ".js", function(g, m) {
        //console.log(g)
        //console.log(m)
        if (g instanceof THREE.Geometry) {
            //g.computeVertexNormals()
            var mesh = new THREE.Mesh(g, new THREE.MeshFaceMaterial(m))
            mesh.scale.copy(that.scale)
            that.obj = mesh
            that.obj.position = that.objStartPos
            gameManager.registerActor(that)
        }   
        })
    this.obj = null
}
TestActor.extends(ACE3.Actor3D, "TestActor")






















