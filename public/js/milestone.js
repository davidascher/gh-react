/** @jsx React.DOM */

// TableSorter Config
var CONFIG = {
  sort: { column: "Number", order: "desc" },
  columns: {
    number: { name: "Number", filterText: "", defaultSortOrder: "asc"},
    title: { name: "Title", filterText: "", defaultSortOrder: "desc"},
    assignee: { name: "Assignee", filterText: "", defaultSortOrder: "desc", slice: "login"}
  }
};

// Inequality function map for the filtering
var operators = {
  "<": function(x, y) { return x < y; },
  "<=": function(x, y) { return x <= y; },
  ">": function(x, y) { return x > y; },
  ">=": function(x, y) { return x >= y; },
  "==": function(x, y) { return x == y; }
};

// TableSorter React Component
var TableSorter = React.createClass({
  getInitialState: function() {
    return {
      items: this.props.initialItems || [],
      sort: this.props.config.sort || { column: "", order: "" },
      columns: this.props.config.columns
    };
  },
  componentWillReceiveProps: function(nextProps) {
    // Load new data when the dataSource property changes.
    if (nextProps.dataSource != this.props.dataSource) {
      this.loadData(nextProps.dataSource);
    }
  },
  componentWillMount: function() {
    this.loadData(this.props.dataSource);
  },
  loadData: function(dataSource) {
    if (!dataSource) return;

    $.get(dataSource).done(function(data) {
      this.setState({items: data});
    }.bind(this)).fail(function(error, a, b) {
      console.log("Error loading JSON");
    });
  },
  handleFilterTextChange: function(column) {
    return function(newValue) {
      var obj = this.state.columns;
      obj[column].filterText = newValue;

      // Since we have already mutated the state, just call forceUpdate().
      // Ideally we'd copy and setState or use an immutable data structure.
      this.forceUpdate();
    }.bind(this);
  },
  columnNames: function() {
     return Object.keys(this.state.columns); 
  },
  sortColumn: function(column) {
    return function(event) {
      var newSortOrder = (this.state.sort.order == "asc") ? "desc" : "asc";

      if (this.state.sort.column != column) {
          newSortOrder = this.state.columns[column].defaultSortOrder;
      }
      this.setState({sort: { column: column, order: newSortOrder }});
    }.bind(this);
  },
  sortClass: function(column) {
    var ascOrDesc = (this.state.sort.order == "asc") ? "headerSortAsc" : "headerSortDesc";
    return (this.state.sort.column == column) ? ascOrDesc : "";
  },
  render: function() {
    var rows = [];

    var columnNames = this.columnNames();
    var filters = {};

    var operandRegex = /^((?:(?:[<>]=?)|==))\s?([-]?\d+(?:\.\d+)?)$/;

    columnNames.forEach(function(column) {
      var filterText = this.state.columns[column].filterText;
      filters[column] = null;

      if (filterText.length > 0) { 
        operandMatch = operandRegex.exec(filterText);
        if (operandMatch && operandMatch.length == 3) {
          //filters[column] = Function.apply(null, ["x", "return x " + operandMatch[1] + " " + operandMatch[2]]);
          filters[column] = function(match) { return function(x) { return operators[match[1]](x, match[2]); }; }(operandMatch); 
        } else {
          filters[column] = function(x) {
            return (x.toString().toLowerCase().indexOf(filterText.toLowerCase()) > -1);
          };
        }
      }
    }, this);
    
    var filteredItems = _.filter(this.state.items, function(item) {
      return _.every(columnNames, function(c) {
        if (this.state.columns[c].slice) {
          if (filters[c]) {
            return filters[c](item[c][this.state.columns[c].slice]);
          }
          return item[c][this.state.columns[c].slice]
        } else {
          if (filters[c]) return filters[c](item[c]);
          return item[c]
        }
      }, this);
    }, this);
    
    var attribute = this.state.sort.column.toLowerCase();
    var slice = this.state.columns[this.state.sort.column.toLowerCase()].slice;
    var sortedItems;
    if (slice == undefined) {
      // no slice, still do case-insensitive sort
      sortedItems = _.sortBy(filteredItems, this.state.sort.column);
      sortedItems = _.sortBy(filteredItems, function(a,b) {
        var value = a[attribute];
        if (value.toLowerCase) return value.toLowerCase();
        return value;
      });
    } else {
      // slice, so do case-insensitive sort of the sliced attribute (e.g. assignee.login)
      sortedItems = _.sortBy(filteredItems, function(a,b) {
        return a[attribute][slice].toLowerCase();
      })
    }
    if (this.state.sort.order === "desc") sortedItems.reverse();

    var headerExtra = function() {
      return columnNames.map(function(c) {
        return <th className="header-extra">{this.state.columns[c].name}</th>;
      }, this);   
    }.bind(this);

    var cell = function(x) {
      return columnNames.map(function(c) {
        if (! x[c]) {
          return <td></td>;
        } else {
          if (this.state.columns[c].slice) {
            return <td>{x[c][this.state.columns[c].slice]}</td>
          } else {
            if (c == 'number') {
              console.log(x);
              return <td><a href={x['html_url']}>{x[c]}</a></td>;
            }
            return <td>{x[c]}</td>;
          }
        }
      }, this);
    }.bind(this);

    sortedItems.forEach(function(item, idx) {
      var headerRepeat = parseInt(this.props.headerRepeat, 10);
      if ((this.props.headerRepeat > 0) && 
          (idx > 0) &&
          (idx % this.props.headerRepeat === 0)) {

          rows.push (
            <tr>
              { headerExtra() }
            </tr>
          )
      }

      rows.push(
        <tr key={item.id}>
          { cell(item) }
        </tr>
      );
    }.bind(this));

    var filterLink = function(column) {
      return {
        value: this.state.columns[column].filterText,
        requestChange: this.handleFilterTextChange(column)
      };
    }.bind(this);

    var header = columnNames.map(function(c) {
      return <th class="filterheader"><span onClick={this.sortColumn(c)} className={"sortindicator header " + this.sortClass(c)}></span>
                 <input class="filter" type="text" placeholder={c} valueLink={filterLink(c)}>
                 </input>
                 
             </th>;
    }, this);

    var filterInputs = columnNames.map(function(c) {
      return <td></td>;
    }, this);

    return (
      <table cellSpacing="0" className="tablesorter">
        <thead>
          <tr>
            { header }
          </tr>
          <tr>
            { filterInputs }
          </tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
    );
  }
});

/* Here we create a two selects to control the remote data source of the 
 * TableSorter component. The purpose of this is to show how to control a 
 * component with another component.
 */
var DataSourceSelectors = React.createClass({
  handleMilestoneChange: function(event) {
    this.props.onSourceChange({
      repo: this.props.source.repo,
      milestone: event.target.value
    });
  },
  handleRepoChange: function(event) {
    this.props.onSourceChange({
      repo: event.target.value,
      milestone: this.props.source.milestone
    });
  },
  render: function() {
    return (
      <div id="tools">
        <span id="repolabel">Repo:</span> 
        <input type="text" size="30" onChange={this.handleRepoChange} defaultValue={this.props.source.repo}></input>
        <span id="milestonelabel">Milestone</span> 
        <input type="text" onChange={this.handleMilestoneChange} defaultValue={this.props.source.milestone}></input>
      </div>
    );
  }
});

function urlForDataSource(source) {
  return "/api/signAndProxy?path=repos/" + source.repo + "/issues&milestone="+source.milestone;
}

var App = React.createClass({
  getInitialState: function() {
    return {source: {repo: "mozilla-appmaker/appmaker", 
                     milestone: "26",
                     state: "all"}};
  },
  handleSourceChange: function(source) {
    this.setState({source: source});
  },
  render: function() {
    return (
      <div>
        <DataSourceSelectors onSourceChange={this.handleSourceChange} source={this.state.source}/>
        <TableSorter dataSource={urlForDataSource(this.state.source)} config={CONFIG}/>
      </div>
    );
  }
});

/** @jsx React.DOM */

var Issue = React.createClass({
  render: function() {
    return <li>{this.props.state} {this.props.title}</li>
  }
});

var Issues = React.createClass({
  getInitialState: function() {
    return {
      source: {
        milestone: 26,
        repo: 'mozilla-appmaker/appmaker',
      }
    };
  },

  componentDidMount: function() {
  },

  render: function() {
    return (
      <TableSorter dataSource={urlForDataSource(this.state.source)} config={CONFIG}/>
    );
  }
});

/** @jsx React.DOM */
var expandos = document.getElementsByClassName("gh-issues");
Array.prototype.forEach.call(expandos, function(expando) {
  React.renderComponent(
    Issues({
      repo: expando.getAttribute('data-repo'),
      milestone: expando.getAttribute('data-milestone'),
      state: expando.getAttribute('data-state')
    }), expando);
});

React.renderComponent(<App />, document.getElementById("app"));