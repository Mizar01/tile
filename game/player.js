function Player() {

    this.energy = 1000

    this.getDamage = function(unit) {
        // TODO
        var ee = unit.energy
        var em = unit.misc
        this.energy -= Math.round(ee / 10)
    }
    
    this.challenge = function(unit) {
        var treshold = 100
        if (player.energy >= unit.energy) {
            treshold = 20
        }else {
            treshold = 90
        }
        var r = Math.random() * 100
        if (r > treshold) {
            unit.destroyUnit()
        }else {
            this.getDamage(unit)
        }
    }

}