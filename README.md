# InventoryFunctions

## How to use

### /create: case first input item
* post json data 
  * code: JAN code
  * name: item name
  * num: import num
  * limit: order specified number
  
* return {}
  
### /getAll: case boot app
* post json ,but body null
* return {"inventory":ItemData[],"order":ItemData[]}

### /increase: case import item
* post json
  * code: JAN code
  * num: import item num
  
* return {"num": update num, "new_place": when inventory === 0 || order === 1 }

### /decrease: case used item
* post json 
  * code: JAN code
  * num: import using num
  
* return {"num": update num, "new_place": when inventory === 0 || order === 1 }

#### when error
 return code 400
 
