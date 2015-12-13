function Group(name, id, owner, permission,threshold) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.permission = permission;
  this.threshold = threshold;
};

Group.prototype.addPerson = function(personId) {
    this.people.push(personId);
};

Group.prototype.removePerson = function(personId) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i]=== personId){
      personIndex = i;
      break;
    }
  }
  this.people.splice(i,1);
};


Group.prototype.removePersonIndex = function(personIndex) {

  this.people.splice(personIndex,1);
};

Group.prototype.isMember = function(personId) {
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i]=== personId){
      return i;
    }
  }
  return false;
};

Group.prototype.permissionType = function() {
  return this.permission;
};

Group.prototype.setPassword = function(pass) {
  this.password = pass;
};

Group.prototype.getPassword = function(pass) {
  return this.password;
};

module.exports = Group;
