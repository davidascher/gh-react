function setFavorite(fave, userId, componentId) {
  $.ajax('/api/favorite', {
    data: {
      componentId: componentId,
      userId: userId,
      favorite: fave
    },
    type: 'post',
    success: function (data) {
    },
    error: function (data, err) {
      console.log("Error setting a favorite flag", err);
    }
  });
}
function toggleStar(star, userId, componentId) {
  var starCount = document.querySelector("#star-" + componentId);
  if (star.classList.contains('fa-star-o')) {
    star.classList.remove('fa-star-o');
    star.classList.add('fa-star');
    setFavorite(true, userId, componentId);
    starCount.textContent = String(Number(starCount.textContent) + 1);
  } else {
    star.classList.remove('fa-star');
    star.classList.add('fa-star-o');
    setFavorite(false, userId, componentId);
    starCount.textContent = String(Number(starCount.textContent) - 1);
  }
}
function checkSubmission(inputField) {
  if (document.querySelector("#component_name").value.length && 
     document.querySelector("#description").value.length && 
     document.querySelector("#sample_apps").value.length) {
   document.querySelector("#ready").classList.remove('disabled');
   document.querySelector("#submit").removeAttribute('disabled');
  } else {
   document.querySelector("#ready").classList.add('disabled');
   document.querySelector("#submit").setAttribute('disabled', 'true');
  }
}
function submitSuggestion() {
  $.ajax('/api/addToWishlist', {
    data: {
      title: document.querySelector("#component_name").value,
      body: document.querySelector("#description").value + '\n\n' + document.querySelector("#sample_apps").value,
      labels: ["suggested component"]
    },
    type: 'post',
    success: function (data) {
    },
    error: function (data, err) {
      console.log("Error setting a favorite flag", err);
    }
  });
}

function fetchIssues() {
  $.ajax('https://api.github.com/repos/davidascher/kitchen/issues', {
    data: {
      'labels': 'suggested component'
    },
    type: 'get',
    success: function(data) {
      console.log("DATA", data);
      var issues = document.querySelector('#issues');
      for (var i = 0; i < data.length;i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var a = document.createElement('a');
        a.textContent = data[i].title;
        a.href = data[i].html_url;
        td.appendChild(a);
        tr.appendChild(td);
        var p = document.createElement('p');
        p.textContent = data[i].body;
        td = document.createElement('td');
        td.appendChild(p);
        tr.appendChild(td);
        issues.appendChild(tr);
        console.log(data[i].title);
      }
    },
    error: function(data, err) {
    }
  });
}

$(document).ready(function() {
  checkSubmission();
  fetchIssues();
});
