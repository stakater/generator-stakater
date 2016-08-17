'use strict';

//Required Dependencies
var generators = require('yeoman-generator');
var path = require('path');
var chalk = require('chalk');
var error = chalk.red.bold;
var yosay = require('yosay');
var Enum = require('enum');

// Global Variables
var __gocdPath = "./modules/gocd/conf/";
var __makefilesPath = "./resources/makefiles";
var __gocdPipelinesGroupHook = "<!--#=== pipelines group hook ===#-->";
//var __modules = ["VPC", "S3", "Iam", "Route53", "ETCD", "Server Certificate", "Global ENV", "Aurora DB", "Docker Registry", "GoCD", "Admiral", "ELK", "EFS", "RDS", "WORKER DEV", "WORKER QA", "Application Launcher"];

// Modules Enum
var __modules = new Enum({"VPC": "vpc", "S3": "s3", 'Iam': "iam", "Route53": "route53", "ETCD": "etcd", "Server Certificate": "server_certificate", "Global ENV": "global_env", "Aurora DB": "aurora_db", "Docker Registry": "docker_registry", "GoCD": "gocd", "Admiral": "admiral", "ELK": "elk", "EFS": "efs", "RDS": "rds", "WORKER DEV": "worker_dev", "WORKER QA": "worker_qa", "Application Launcher": "application_launcher"});



module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
      this.selectedModules = [];
  },

  //Ask for user input
  prompting: function() {
      this._modulesRequiredQuestion();
  },

  writing: function() {
      /*var stakaterDeployClusterTemplate = this.fs.read(this.templatePath("stakater_deploy_cluster_template.xml"));
      var configFileTemplate = this.fs.read(this.templatePath("cruise-config.xml.temp"));

      // Update stakater deploy cluster template and add to output config file
      var updatedStakaterDeployClusterTemplate = stakaterDeployClusterTemplate.replace("<%= appName %>",  "NEW_APP_NAME");
      this.fs.write(path.join(__gocdPath, 'cruise-config.xml'), configFileTemplate.replace(__gocdPipelinesGroupHook, __gocdPipelinesGroupHook + "\n" + updatedStakaterDeployClusterTemplate))*/
  },


//################## Private Methods ##################//
/////################## Questions ##################//

  _modulesRequiredQuestion: function() {
    var done = this.async();
    this.prompt([
    {
      type: 'checkbox',
      message: 'Select modules to create:',
      name: 'modules',
      choices: this._getCompleteModulesList(),
          
      validate: function (answer) {
        if (answer.length < 1) {
          return error('You must choose at least one module.');
        }
        return true;
      }
    }], function (answers) {
      this.log("Executed");
      this.log("Modules Selected: " + answers.modules);
      this.selectedModules = answers.modules;
      this._createStakaterModulesMakefile();
      done();
    }.bind(this));
  },


/////################## Actions ##################//

  _createStakaterModulesMakefile: function() {
      this.fs.copyTpl(
        this.templatePath(path.join(__makefilesPath, 'stakater_modules.mk')),
        this.destinationPath(path.join(__makefilesPath, 'stakater_modules.mk')),
        // Add values input from user to template
        { 
          SELECTED_MODULES   : this._getModulesToCreate(),   
          MODULES_TO_DESTROY : this._getModulesToDestroy()
        }
      );
  },


/////################## Helping Methods ##################//

  _getCompleteModulesList:  function() {
    var modules = [];

    __modules.enums.forEach(function(enumItem) {
        modules.push(enumItem.key);
    });

    return modules;
  },

  _getModulesToCreate: function() {
    var modulesToCreate = "";

    this.selectedModules.forEach(function(module) {
       modulesToCreate = modulesToCreate + " " +  __modules.get(module).value;
    });

    return modulesToCreate
  },

  _getModulesToDestroy: function() {
    var modulesToDestroy = "";

    this.selectedModules.forEach(function(module) {
       modulesToDestroy = " destroy_" +  __modules.get(module).value + modulesToDestroy;
    });

    return modulesToDestroy
  }

});