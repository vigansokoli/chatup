function Group(name, id, owner, permission) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  this.permission = permission;
  //this.peopleLimit = 4;
  //this.status = "available";
  //this.private = false;
};

Group.prototype.addPerson = function(person) {
    this.people.push(person);
};

Group.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i].id === person.id){
      personIndex = i;
      break;
    }
  }
  this.people.remove(personIndex);
};

Group.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};

Group.prototype.permissionType = function() {
  return this.permission;
};

Group.prototype.setPassword = function(pass) {
  this.password = pass;
};

module.exports = Group;
