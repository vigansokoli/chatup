function Person(id, name) {
  //this.name = name;
  this.id = id;
  this.name = name;
  this.groups = [];
  //this.status = "available";
  //this.private = false;
};

Person.prototype.addGroup = function(groupId) {
    this.groups.push(groupId);
};

Person.prototype.removeGroup = function(group) {
var groupIndex = -1;
  for(var i = 0; i < this.groups.length; i++){
    if(this.groups[i].id === group.id){
      groupIndex = i;
      break;
    }
  }
  this.groups.remove(personIndex);
};

module.exports = Person;
