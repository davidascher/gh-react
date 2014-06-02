var secrets = require('../config/secrets');
var User = require('../models/User');
var querystring = require('querystring');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var Github = require('github-api');
var Component = require('../models/Component');

var GitHubApi = require("github");
var github = new GitHubApi({
    // required
    version: "3.0.0",
    debug: true
});
var http = require('http'),
    fs = require('fs'),
    httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
//httpProxy.createProxyServer({target:'https://api.github.com',
//                               headers : { 
//                                  host : 'api.github.com'
//                                },
//                               ssl: {
//                                key: fs.readFileSync('key.pem', 'utf8'),
//                                cert: fs.readFileSync('cert.pem', 'utf8')
//                              },
//                             secure: true
//                            }).listen(process.env.PORT || 5000);
//
exports.addToWishlist = function(req, res) {
  var accessToken = req.user.tokens[0].accessToken;
  var url = "https://api.github.com/repos/davidascher/kitchen/issues"
  url += "?access_token="+encodeURIComponent(accessToken);
  var options = {
      url: url,
      body: JSON.stringify(req.body),
      headers: {
          'User-Agent': 'NodeJS HTTP Client'
      }
  };
  request.post(options, function(err, ret, body) {
    if (err) {
      res.json('500', err);
    } else {
      res.json('200');
    }
  });
}


exports.signAndProxy = function(req, res) {
  var accessToken = req.user.tokens[0].accessToken;
  console.log("WE HAVE ACCESS TOKEN", accessToken);
  var path = req.query.path;
  var url = "https://api.github.com/" + req.query.path;
  delete req.query['path'];
  req.query['access_token'] = accessToken;
  url += "?" + querystring.stringify(req.query);
  console.log("GITHUB URL =", url);
  var options = {
      url:  url,
      body: JSON.stringify(req.body),
      headers: {
          'User-Agent': 'NodeJS HTTP Client'
      }
  };
  console.log("CALLING GITHUB", options.url);
  request.get(options, function(err, ret, body) {
    if (err) {
      res.json('500', err);
    } else {
      res.json('200', JSON.parse(body));
    }
  });
}

exports.getIssuesForMilestone = function(req, res) {
  var accessToken = req.user.tokens[0].accessToken;
  var milestone = req.query.milestone;
  var repo = req.query.repo;
  var url = "https://api.github.com/repos/" + repo + "/issues"
  url += "?milestone="+encodeURIComponent(milestone) + 
         "&access_token="+encodeURIComponent(accessToken);
  var options = {
      url: url,
      body: JSON.stringify(req.body),
      headers: {
          'User-Agent': 'NodeJS HTTP Client'
      }
  };
  request.get(options, function(err, ret, body) {
    if (err) {
      res.json('500', err);
    } else {
      res.json('200', {issues: JSON.parse(body)});
    }
  });
}

exports.createRepo =function(req, res) {
  return;
  var accessToken = req.user.tokens[0].accessToken;
  var url = "https://api.github.com/user/repos"
  url += "?access_token="+encodeURIComponent(accessToken);
  var body = {};
  body.name = req.body.repo_name;
  body.has_wiki = false;
  body.has_downloads = false;
  body.auto_init = true;
  var options = {
      url: url,
      body: JSON.stringify(req.body),
      headers: {
          'User-Agent': 'NodeJS HTTP Client'
      }
  };
  request.post(options, function(err, ret, body) {
    if (err) {
      res.json('500', err);
    } else {
      var url = "https://api.github.com/repos/" + github_userid + '/' + req.body.repo_name;
      url += "?access_token="+encodeURIComponent(accessToken);
      var body = {};
      body.default_branch = 'gh-pages';
      var options = {
          url: url,
          body: JSON.stringify(req.body),
          headers: {
              'User-Agent': 'NodeJS HTTP Client'
          }
      };
      request.patch(options, function(err, ret, body) {
        
      });

      res.json('200');
    }
  });
}

exports.getWishlist = function(accessToken, errCB, okCB) {
  var url = "https://api.github.com/repos/davidascher/kitchen/issues"
  url += "?access_token="+encodeURIComponent(accessToken);
  var options = {
      url: url,
      headers: {
          'User-Agent': 'NodeJS HTTP Client'
      }
  };
  request.get(options, function(err, ret, body) {
    if (err) {
      errCB && errCB(err);
    } else {
      okCB && okCB(ret, body);
    }
  });
}


/**
 * GET /api
 * List of API examples.
 */

exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Browser'
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = function(req, res) {
  var token = _.findWhere(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });
};

exports.favorite = function(req, res) {
  Component.findById(req.body.componentId, function(err, foundComponent) {
    if (! foundComponent) {
      return res.json(500, "Couldn't find component with id: " + req.body.componentId);
    }
    fans = foundComponent.fans;
    var fave = req.body.favorite == 'true';
    var user = req.body.userId;
    if (fave) {
      if (user in fans) return res.json(200, "already was favorite");
      fans.push(user);
    } else {
      var index = fans.indexOf(user);
      if (index == -1) {
        return res.json(200, "already was not favorite");
      }
      fans.splice(index, 1);
    }
    Component.update({_id : req.body.componentId},
      {$set: {fans: fans}}, {},
      function(err,obj){
        if(err){
          return res.json(500, {error: 'Fan list was not renamed due to ' + err});
        } else {
          return res.json(200, {message: 'Fan list updated successfully'});
        }
      }
    );
  });
}
