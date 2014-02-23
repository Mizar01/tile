function Player() {

    this.life = 100
    this.light = 0
    this.shadow = 4
    this.blood = 0
    this.fear = 0
    
    this.attack = 3
    

    this.getDamage = function(unit) {
        
        this.life -= unit.attack

    }
    
    this.challenge = function(unit) {
        
        var c = unit.getChanceToWin()
        var r = Math.random() * 100
        if (r < c) {
            unit.getDamage()
        }else {
            this.getDamage(unit)
        }
        
        unitInfoBox.updateText(unit.buildInfoText())
        
    }

}