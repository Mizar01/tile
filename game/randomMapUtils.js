
TileRandomMap = function(mapX, mapZ) {
    
    this.map = [] //define map based on map size
    this.mapX = mapX
    this.mapZ = mapZ
    this.sx = null
    this.sz = null
    this.ex = null
    this.ez = null
    
    this.iter = 0
    this.maxIter = 100
    
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
    }
    
    this.buildMap = function() {
        var sc = new TileTempCell(this.sx, this.sz, null)
        this.map[this.sx][this.sz] = sc
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
    }
    
    

    
    this.process = function(tmpCell) {
        
        this.iter ++

        console.log(tmpCell.x + ", " + tmpCell.z)

        // procedure limit (or it will suck all your RAM !)
        if (this.iter > this.maxIter) {
            return
        }
        
        if (tmpCell.x == this.endX && tmpCell.z == this.endZ) {
            return // I found the ending CELL !
        }
       
        var markIndex = [0, 1, 2, 3]
        var foundIndex = -1
        
        while (foundIndex == -1) {

            console.log(markIndex)
            
            if (markIndex.length == 0) {
                foundIndex = -1
                break
            }
            var rd = Math.round(Math.random() * (markIndex.length - 1))
            if (this.isValidDir(tmpCell, markIndex[rd])) {
                foundIndex = markIndex[rd]
                break
            }else {
                // delete markIndex
                markIndex = markIndex.splice(rd,1)
                continue
            }
        }
        
        if (foundIndex != -1) {
            console.log("Chosed Direction " + foundIndex)
            var xz = this.getCoords(tmpCell.x, tmpCell.z, foundIndex)
            var cell = new TileTempCell(xz.x, xz.z, tmpCell, foundIndex)
            this.map[xz.x][xz.z] = cell 
        }else {
            //return to parent processing, losing the tmpCell
            var cell = tmpCell.p
            if (cell == null) {
                console.log("I failed to find a path !!")
                return
            }
            console.log("No paths found, returning to parent !")
            cell.dirs[tmpCell.prevDirIndex] = 1  //marking this parent direction as bad.
            this.map[tmpCell.x][tmpCell.z] = null
        }
        
        //recursion
        this.process(cell)
        
        //if i'm here i finished every recursion.
        
    }
    
    this.getCoords = function(ox, oz, dir) {
        if (dir == 0) {  //north
            return {x: ox, z: oz + 1}
        }else if (dir == 1) {  //south
            return {x: ox, z: oz - 1}
        }else if (dir == 1) {  //west
            return {x: ox + 1, z: oz}
        }else { //east
            return {x: ox - 1, z: oz}
        }
    }
    
    this.isValidDir = function(tc, dir) {
        
        if (tc.dirs[dir] == 1) {
            return false
        }
        
        var xz = this.getCoords(tc.x, tc.z, dir)
        var x = xz.x
        var z = xz.z
        //console.log(x + "**" + z)
        if (x < 0 || z < 0 || x >= this.mapX || z >= this.mapZ) {
            return false
        }else if (this.map[x][z] != null) {
            return false
        }
        
        return true;
    }

}



TileTempCell = function(x,z, parent, prevDirection) {
    
    this.x = x
    this.z = z
    this.dirs = [0, 0, 0, 0]
    this.p = parent   //if null , it is the start cell.
    this.prevDirIndex //direction of the parent towards this cell.
    
 
}