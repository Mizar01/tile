
TileRandomMap = function(mapX, mapZ) {
    
    this.map = [] //define map based on map size
    this.mapX = mapX
    this.mapZ = mapZ
    this.sx = null
    this.sz = null
    this.ex = null
    this.ez = null
    
    this.iter = 0
    this.maxIter = 2000
    
    this.init = function() {
        for (var x = 0; x < this.mapX; x++) {
            this.map[x] = []
            for (var z = 0; z < this.mapZ; z++) {
                this.map[x][z] = null
                //console.log("this.map[" +x + "][" + z + "]")
            }
        }
        this.sx = Math.round(Math.random() * (this.mapX - 1))
        this.ex = Math.round(Math.random() * (this.mapX - 1))
        this.sz = Math.round(Math.random() * (this.mapZ - 1))
        this.ez = Math.round(Math.random() * (this.mapZ - 1))
        
        console.log("Starting cell :" + this.sx + "," + this.sz)
        console.log("Ending cell :" + this.ex + "," + this.ez)
    }
    
    this.buildMap = function() {
        var sc = new TileTempCell(this.sx, this.sz)
        this.storeMap(sc)
        this.process(sc)
        return this.convertToString()    
    }
    
    this.convertToString = function() {
        var s = ""
        for (var z = 0; z < this.mapZ; z++) {
            for (var x = 0; x < this.mapX; x++) {
                if (x == this.sx && z == this.sz) {
                    s += "ST,"
                }else if (x == this.ex && z == this.ez) {
                    s += "EN,"
                }else if (this.map[x][z] != null) {
                    s += "01,"
                }else {
                    s += "**,"
                }
            }
            s = s.substring(0, s.length - 1) + "-"
        }
        s = s.substring(0, s.length - 1)
        return s
    }
    
    

    
    this.process = function(tmpCell) {
        
        this.iter ++

        //console.log("********** [iter : " + this.iter +
        //            "] Evaluating : " + tmpCell.x + ", " + tmpCell.z + "****************")

        // procedure limit (or it will suck all your RAM !)
        if (this.iter > this.maxIter) {
            alert("Random map failed due to Too many iterations. Please retry.")
            return "END" //finished because of limited resources
        }
        
        if (tmpCell.x == this.ex && tmpCell.z == this.ez) {
            return "END"  // finished.
        }
       
         
        //calculate all valid directions
        var validDirs = []
        for (var i = 0; i < 4; i++) {
            if (this.isValidDir(tmpCell, i)) {
                validDirs.push(i)
            }
            if (this.dirIsEnd(tmpCell, i)) {
                return "END"
            }
        }
        
        rd = -1
        if (validDirs.length == 0) {
            //return to parent processing, losing the tmpCell
            if (tmpCell.p == null) {
                console.log("I found the start cell ! I failed to find a path !!")
                return "END"
            }
            //console.log("No paths found, returning to parent !")
            this.removeMap(tmpCell)
            this.process(tmpCell.p)
        
        }else {
            //console.log("validDirs = " + this.dirsToName(validDirs))
            var rdIndex = Math.round(Math.random() * (validDirs.length - 1))
            var rd = validDirs[rdIndex]
            //console.log("Chosen direction : " + this.dirToName(rd))
            var cell = this.createCellFromDirection(tmpCell, rd)
            this.storeMap(cell)
            this.process(cell)
        }
        
        return "END"
  
    }
    

    
    this.dirsToName = function(dirs) {
        var o = []
        for (var i = 0; i < dirs.length; i++) {
            o.push(this.dirToName(dirs[i]))
        }
        return o
    }
    
    this.dirToName = function(dir) {
        var n = ["N", "S", "W", "E"]
        return n[dir]
    }
    
    this.storeMap = function(c) {
        this.map[c.x][c.z] = c
    }
    
    this.removeMap = function(c) {
        this.map[c.x][c.z] = null
    }
    
    this.createCellFromDirection = function(c, d) {
        var xz = this.getCoords(c.x, c.z, d)
        var cell = new TileTempCell(xz.x, xz.z, c)
        //mark already the direction toward the parent as bad and viceversa
        if (d == 0) {
            cell.dirs[1] = 1
            c.dirs[0] = 1
        }else if (d == 1) {
            cell.dirs[0] = 1
            c.dirs[1] = 0
        }else if (d == 2) {
            cell.dirs[3] = 1
            c.dirs[2] = 1
        }else if (d == 3) {
            cell.dirs[2] = 1
            c.dirs[3] = 1
        }
        return cell
    }
    
    this.dirIsEnd = function(c, d) {
        var xz = this.getCoords(c.x, c.z, d)
        var x = xz.x
        var z = xz.z
        var isEnd = (this.ex == x && this.ez == z)
        //console.log("end(" + x + "," + z + ") = " + isEnd + " -> " + this.ex + "," + this.ez)
        return isEnd
    }
    
    this.getCoords = function(ox, oz, dir) {
        if (dir == 0) {  //north
            return {x: ox, z: oz - 1}
        }else if (dir == 1) {  //south
            return {x: ox, z: oz + 1}
        }else if (dir == 2) {  //west
            return {x: ox - 1, z: oz}
        }else { //east
            return {x: ox + 1, z: oz}
        }
    }
    
    this.getOpposite = function(dir) {
        var od = [1, 0, 3, 2]
        return od[dir]
    }
    
    this.isValidDir = function(tc, dir) {
        
        if (tc.dirs[dir] == 1) {
            return false
        }
        
        var xz = this.getCoords(tc.x, tc.z, dir)
        //console.log("Coords from dir (" + this.dirToName(dir)+ "):" + xz.x + "," + xz.z)
        var x = xz.x
        var z = xz.z
        
        if (!this.isValidCell(x, z)) {
            return false
        }
        
        //console.log(x + "**" + z)
        if (!this.isFreeCell(x, z, this.getOpposite(dir))) {
            return false
        }
        
        return true;
    }
    
    this.isValidCell = function(x, z) {
        return (x > 0 && z > 0 && x < this.mapX && z < this.mapZ)
    }
    
    this.isFreeCell = function(x, z, excDir) {
        
        if (this.map[x][z] != null){
            return false
        }
        
        for (var i in [0, 1, 2, 3]) {
            if (i == excDir) {
                continue
            }
            var xz = this.getCoords(x, z, i)
            var vx = xz.x
            var vz = xz.z
            //console.log(x, z, vx, vz)
            if (!this.isValidCell(vx, vz)) {
                return false
            }
            //console.log(vz, vz, this.map[vx])
            if (this.map[vx][vz] != null) {
                
                return false
            }
        }

        return true
        
    }

}



TileTempCell = function(x,z, parent) {
    
    this.x = x
    this.z = z
    this.dirs = [0, 0, 0, 0]
    this.p = parent   //if null , it is the start cell.
 
}