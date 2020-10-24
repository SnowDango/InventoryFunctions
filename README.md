# InventoryFunctions

## How to use

### /create: case first input item
* post json data 
  * code: JAN code
  * name: item name
  * num: import num
  
* return "SUCCESS" or "ERROR"
  
### /getAll: case boot app
* post json ,but body null
* return itemData or "ERROR" 

### /increase: case import item
* post json
  * code: JAN code
  * num: import item num
  
* return update item num or "ERROR"

### /decrease: case used item
* post json 
  * code: JAN code
  * num: import using num
  
* return update item num or "ERROR"
