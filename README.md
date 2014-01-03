tile
====

Game with tiles.

* Make a new version of ace3 based on the modifications added to the end of tileGame.

* RE DO !!! All the logic with tileBeams enablers must be revisited and simplified. Is too complicated
  to manage and avoid race condition in this manner.
  The new way should be :
  At every step (run()) TB1 check if there's some TB2 enabled by it.
  if TB2 != null and TB2 != TB1.enabledTarget (previous enabledTaget by TB1) 
      remove TB1 from TB1.enabledTarget.enablersSet
  In any case:
  if TB2 exists TB1 is added to an TB2.enablersSet and TB2 is added to TB1.enabledTarget
  NOTE : make sure enablersSet is managing single instances of objects (it could be dictionary)
   (e.g. an object cannot be added twice)
  NOTE : enablersSet may be used even to manage the logic of enabling with normal tiles.



* in the editor the '+' at the end and the comma ','

- the tileUnit is clickable but you should not be able to attack it if there is no connection.