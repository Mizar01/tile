
TileRandomMap = function(mapX, mapZ) {
    
    this.map = [] //define map based on map size
    this.wmap = []
    this.mapX = mapX
    this.mapZ = mapZ
    this.sx = null
    this.sz = null
    this.ex = null
    this.ez = null
    
    this.iter = 0
    this.maxIter = 1000
    
    this.init = function() {
        for (var x = 0; x < this.mapX; x++) {
            this.map[x] = []
            this.wmap[x] = []
            for (var z = 0; z < this.mapZ; z++) {
                this.map[x][z] = null
                this.wmap[x][z] = 0
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
        for (var x = 0; x < this.mapX; x++) {
            for (var z = 0; z < this.mapZ; z++) {
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
            s = s.substring(0, s.length - 1) + "-\n"
        }
        return s
    }
    
    

    
    this.process = function(tmpCell) {
        
        this.iter ++

        console.log("********** [iter : " + this.iter +
                    "] Evaluating : " + tmpCell.x + ", " + tmpCell.z + "****************")

        // procedure limit (or it will suck all your RAM !)
        if (this.iter > this.maxIter) {
            return "END" //finished because of limited resources
        }
        
        if (tmpCell.x == this.ex && tmpCell.z == this.ez) {
            return "END"  // finished.
        }
       
   
        while (true) {   
            //calculate all valid directions
            var validDirs = []
            for (var i = 0; i < 4; i++) {
                if (this.isValidDir(tmpCell, i)) {
                    validDirs.push(i)
                }
            }
            
            rd = -1
            if (validDirs.length == 0) {
                //return to parent processing, losing the tmpCell
                if (tmpCell.p == null) {
                    console.log("I found the start cell ! I failed to find a path !!")
                    return "END"
                }
                console.log("No paths found, returning to parent !")
                this.removeMap(tmpCell)
                this.delWMapDirs(tmpCell)
                return "BAD"
            
            }else {
                //console.log("validDirs = " + this.dirsToName(validDirs))
                var rdIndex = Math.round(Math.random() * (validDirs.length - 1))
                var rd = validDirs[rdIndex]
                //console.log("Chosen direction : " + this.dirToName(rd))
                var cell = this.createCellFromDirection(tmpCell, rd)
                this.addWMapDirs(tmpCell)
                this.storeMap(cell)
            }
            
            //recursion
            var res = this.process(cell)
            if (res == "END") {
                return "END"
            }else if (res == "BAD") {
                cell.dirs[rd] = 1  //marking this direction as bad. and continue
                continue
            }else {
                return "GOOD"
            }
        }
        
    }
    
    this.addWMapDirs = function(c) {
        for (var i = 0; i < c.dirs.length; i++) {
            xz = this.getCoords(c.x, c.z, i)
            var x = xz.x
            var z = xz.z
            if (x < 0 || z < 0 || x >= this.mapX || z >= this.mapZ) {
                continue
            }else {
                this.wmap[x][z] ++
            }
        }
    }
    
    this.delWMapDirs = function(c) {
        for (var i = 0; i < c.dirs.length; i++) {
            xz = this.getCoords(c.x, c.z, i)
            var x = xz.x
            var z = xz.z
            if (x < 0 || z < 0 || x >= this.mapX || z >= this.mapZ) {
                continue
            }else {
                this.wmap[x][z] --
                if (this.wmap[x][z] < 0) {
                    this.wmap[x][z] = 0
                }
            }
        }
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
        //mark already the direction toward the parent as bad
        if (d == 0) {
            cell.dirs[1] = 1
        }else if (d == 1) {
            cell.dirs[0] = 1
        }else if (d == 2) {
            cell.dirs[3] = 1
        }else if (d == 3) {
            cell.dirs[2] = 1
        }
        return cell
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
    
    this.isValidDir = function(tc, dir) {
        
        if (tc.dirs[dir] == 1) {
            return false
        }
        
        var xz = this.getCoords(tc.x, tc.z, dir)
        //console.log("Coords from dir (" + this.dirToName(dir)+ "):" + xz.x + "," + xz.z)
        var x = xz.x
        var z = xz.z
        //console.log(x + "**" + z)
        if (x < 0 || z < 0 || x >= this.mapX || z >= this.mapZ) {
            return false
        }else if (this.wmap[x][z] > 0) {
            return false
        }
        
        return true;
    }

}



TileTempCell = function(x,z, parent) {
    
    this.x = x
    this.z = z
    this.dirs = [0, 0, 0, 0]
    this.p = parent   //if null , it is the start cell.
 
}