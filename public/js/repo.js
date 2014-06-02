//repo.js


function selectSuggestion(suggestion) {
   var items = document.querySelectorAll(".desc");
   for (i = 0; i < items.length; i++) { 
     items[i].classList.add('hidden');
   }
   var selector = "#"+suggestion;
   document.querySelector(selector).classList.remove('hidden');
}

function updateNames(inputField) {
  var name = inputField.value;
  var repoName = name.replace(/[\W_]+/g, '-').replace(/^(\d)/, '_$1').toLowerCase();
  document.querySelector('#repo_name').value = 'component-' + repoName;
  var jsName = name.replace(/[\W_]+/g, '_').replace(/^(\d)/, '_$1').toLowerCase();
  document.querySelector('#js_name').value = jsName;
  checkIfReady();
}

function checkIfReady() {
  if (document.querySelector("#component_name").value.length && 
      document.querySelector("#repo_name").value.length && 
      document.querySelector("#js_name").value.length) {
    document.querySelector("#ready").classList.remove('disabled');
    document.querySelector("#submit").removeAttribute('disabled');
  } else {
    document.querySelector("#ready").classList.add('disabled');
    document.querySelector("#submit").setAttribute('disabled', 'true');
  }
}

function createRepo() {
  var compName = document.querySelector("#component_name").value;
  var repoName = document.querySelector("#repo_name").value;
  var jsName = document.querySelector("#js_name").value;
  $.ajax('/api/createRepo', {
    data: {
      'component_name': compName,
      'repo_name': repoName,
      'js_name': jsName
    },
    type: 'post',
    success: function(data) {
      alert('repo created');
    },
    error: function(data, error) {
      alert(error);
    }
  });
  console.log(compName, repoName, jsName);
}

function getIssues(cb, err) {
  $.ajax('https://api.github.com/repos/davidascher/kitchen/issues', {
    data: {
      'labels': 'suggested component'
    },
    type: 'get',
    success: function(data) {
      cb && cb(data);
    },
    error: function(data, error) {
      err && err(error);
    }
  });
}

$(document).ready(function() {
  var tabs = document.querySelector('#tabs');
  var descs = document.querySelector('#descs');
  getIssues(function(issues) {
    for (var i = 0; i < issues.length;i++) {
      var issue = issues[i];
      var li = document.createElement('li');
      if (i == 0) {
        li.classList.add('active');
      }
      console.log(issue);
      var a = document.createElement('a');
      a.setAttribute('data-toggle', 'tab');
      a.setAttribute('onclick', "selectSuggestion('issue_" + issue.id + "')"); // XXX
      a.textContent = issue.title;
      li.appendChild(a);
      tabs.appendChild(li);

      var div = document.createElement('div');
      div.setAttribute('id', "issue_" + issue.id);
      div.classList.add('desc');
      div.classList.add('hidden');
      h4 = document.createElement('h4');
      h4.textContent = issue.title;
      p = document.createElement('p');
      p.textContent = issue.body;
      div.appendChild(h4);
      div.appendChild(p);
      descs.appendChild(div);
    }
    selectSuggestion("issue_" + issues[0].id.toString());

  });
});
