( function(Dataflow) {
 
  // Dependencies
  var BaseResizable = Dataflow.node("base-resizable");
  var DataflowSubgraph = Dataflow.node("dataflow-subgraph");

  var Graph = Dataflow.module("graph");
  var Input = Dataflow.module("input");
  var Output = Dataflow.module("output");

  DataflowSubgraph.Model = BaseResizable.Model.extend({
    defaults: {
      label: "subgraph",
      type: "dataflow-subgraph",
      x: 200,
      y: 100,
      graph: {}
    },
    initialize: function() {
      BaseResizable.Model.prototype.initialize.call(this);

      var graph = this.get("graph");
      graph.parentNode = this;
      this.graph = new Graph.Model(graph);

      // Initialize i/o from subgraph
      var inputs = this.graph.nodes.filter(function(node){
        return (node.type === "dataflow-input");
      });
      _.each(inputs, this.addInput, this);
      var outputs = this.graph.nodes.filter(function(node){
        return (node.type === "dataflow-output");
      });
      _.each(outputs, this.addOutput, this);

      // Listen for new i/o
      this.graph.nodes.on("add", function(node){
        if (node.type === "dataflow-input") {
          this.addInput(node);
        } else if (node.type === "dataflow-output") {
          this.addOutput(node);
        }
      }, this);

      // Listen for removing i/o
      this.graph.nodes.on("remove", function(node){
        if (node.type === "dataflow-input") {
          this.removeInput(node);
        } else if (node.type === "dataflow-output") {
          this.removeOutput(node);
        }
      }, this);
    },
    addInput: function(input){
      var newInput = new Input.Model({
        id: input.id,
        label: input.get("label"),
        type: input.get("input-type"),
        parentNode: this,
        inputNode: input
      });
      this.inputs.add(newInput);
    },
    addOutput: function(output){
      var newOutput = new Output.Model({
        id: output.id,
        label: output.get("label"),
        type: output.get("output-type"),
        parentNode: this,
        outputNode: output
      });
      this.outputs.add(newOutput);
    },
    removeInput: function(node){
      var input = this.inputs.get(node.id);
      input.remove();
      this.inputs.remove(input);
    },
    removeOutput: function(node){
      var output = this.outputs.get(node.id);
      output.remove();
      this.outputs.remove(output);
    },
    toJSON: function(){
      var json = BaseResizable.Model.prototype.toJSON.call(this);
      json.graph = this.graph;
      return json;
    },
    remove: function(){
      BaseResizable.Model.prototype.remove.call(this);
      this.graph.remove();
    },
    inputs:[
    ],
    outputs:[
    ]
  });

  var innerTemplate = '<button class="show-subgraph">edit subgraph</button>';

  DataflowSubgraph.View = BaseResizable.View.extend({
    events: function(){
      var events = BaseResizable.View.prototype.events.call(this);
      events["click .show-subgraph"] = "showSubgraph";
      return events;
    },
    innerTemplate: _.template(innerTemplate),
    initialize: function() {
      BaseResizable.View.prototype.initialize.call(this);
      this.model.graph.view = new Graph.View({model:this.model.graph});

      // Listen for label changes
      this.model.inputs.each(this.addInput, this);
      this.model.inputs.on("add", this.addInput, this);
      this.model.outputs.each(this.addOutput, this);
      this.model.outputs.on("add", this.addOutput, this);
    },
    addInput: function(input){
      // Listen for label changes
      input.get("inputNode").on("change:label", function(i){
        input.view.$(".label").text(i.get("label"));
      }, this);
    },
    addOutput: function(output){
      // Listen for label changes
      output.get("outputNode").on("change:label", function(o){
        output.view.$(".label").text(o.get("label"));
      }, this);
    },
    showSubgraph: function(){
      Dataflow.showGraph(this.model.graph);

      // var navigation = $("<div />");

      // // Make navigation
      // var navToGraph = this.model.graph;
      // while (navToGraph.get("parentNode")) {
      //   // console.log(navToGraph.get("parentNode").get("label"));
      //   var button = $("<button>")
      //     .text( navToGraph.get("parentNode").get("label") )
      //     .click(function(){
      //       Dataflow.showGraph(navToGraph);
      //     });
      //   navigation.prepend(button);
      //   // Next up?
      //   navToGraph = navToGraph.get("parentNode").get("parentGraph");
      // }

      // this.model.graph.view.$(".graph-controls")
      //   .append(navigation);
      
      this.model.graph.view.render();
    },
    closeSubgraph: function(){
      Dataflow.showGraph(this.model.parentGraph);
    }
  });

}(Dataflow) );
