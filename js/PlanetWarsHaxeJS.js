(function () { "use strict";
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var IMap = function() { }
IMap.__name__ = true;
var PlanetWars = function() { }
$hxExpose(PlanetWars, "PlanetWars");
PlanetWars.__name__ = true;
PlanetWars.main = function() {
	haxe.Log.trace = PlanetWars.log;
	haxe.Log.trace("application launched",{ fileName : "PlanetWars.hx", lineNumber : 37, className : "PlanetWars", methodName : "main"});
}
PlanetWars.gameCompleteHandler = function(event) {
	var r = event;
	if(PlanetWars._saveURL != "" && r.winner.id == r.p1.id) {
		haxe.Log.trace("sauvegarde du score",{ fileName : "PlanetWars.hx", lineNumber : 43, className : "PlanetWars", methodName : "gameCompleteHandler"});
		var request = new haxe.Http(PlanetWars._saveURL);
		request.onStatus = PlanetWars.addScore_completeHandler;
		request.setParameter("player",r.p1.name);
		request.setParameter("score",Std.string(r.playerOneScore / r.numTurn * 1000));
		request.request(true);
	} else if(PlanetWars._saveURL != "") PlanetWars.redirect(1); else PlanetWars.redirect(0);
}
PlanetWars.redirect = function(playerStatus) {
	if(PlanetWars._redirectURL != "") js.Browser.window.location.assign(PlanetWars._redirectURL + "?playerStatus=" + Std.string(playerStatus));
}
PlanetWars.addScore_completeHandler = function(event) {
	haxe.Log.trace("status : " + Std.string(event),{ fileName : "PlanetWars.hx", lineNumber : 64, className : "PlanetWars", methodName : "addScore_completeHandler"});
	PlanetWars.redirect(2);
}
PlanetWars.init = function(firstPlayerName,firstPlayerScript,secondPlayerName,secondPlayerScript,saveURL,redirectURL,baseURL) {
	if(baseURL == null) baseURL = "";
	if(redirectURL == null) redirectURL = "";
	if(saveURL == null) saveURL = "";
	PlanetWars._saveURL = saveURL;
	PlanetWars._redirectURL = redirectURL;
	PlanetWars.BASE_URL = baseURL;
	var applicationCanvas = js.Browser.document.getElementById("applicationCanvas");
	applicationCanvas.width = 771;
	applicationCanvas.height = 435;
	PlanetWars._renderer = new com.tamina.planetwars.server.BattleRenderer(applicationCanvas,applicationCanvas.width,applicationCanvas.height);
	bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"gameComplete",PlanetWars.gameCompleteHandler);
	PlanetWars._renderer.init(new com.tamina.planetwars.data.Player(firstPlayerName,16711680,firstPlayerScript),new com.tamina.planetwars.data.Player(secondPlayerName,65280,secondPlayerScript));
	if(PlanetWars._saveURL != "") PlanetWars._renderer.start();
}
PlanetWars.log = function(v,inf) {
	js.Browser.document.getElementById("haxe:trace").innerHTML += Std.string(v) + "<br/>";
}
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
var com = {}
com.tamina = {}
com.tamina.planetwars = {}
com.tamina.planetwars.core = {}
com.tamina.planetwars.core.EventDispatcher = function() {
};
com.tamina.planetwars.core.EventDispatcher.__name__ = true;
com.tamina.planetwars.core.EventDispatcher.getInstance = function() {
	if(com.tamina.planetwars.core.EventDispatcher._instance == null) com.tamina.planetwars.core.EventDispatcher._instance = js.Browser.document.body;
	return com.tamina.planetwars.core.EventDispatcher._instance;
}
com.tamina.planetwars.core.EventDispatcher.prototype = {
	__class__: com.tamina.planetwars.core.EventDispatcher
}
com.tamina.planetwars.core.EventType = function() { }
com.tamina.planetwars.core.EventType.__name__ = true;
com.tamina.planetwars.core.GameEngine = function() {
	this._currentTurn = 0;
	this._isComputing = false;
	this.playerOneScore = 0;
	this.playerTwoScore = 0;
};
com.tamina.planetwars.core.GameEngine.__name__ = true;
com.tamina.planetwars.core.GameEngine.prototype = {
	get_isComputing: function() {
		return this._isComputing;
	}
	,increasePlanetGrowth: function() {
		var _g1 = 0, _g = this._galaxy.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			var planet = this._galaxy.content[i];
			planet.population += 5;
			if(planet.population > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size)) planet.population = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(planet.size);
		}
	}
	,getPlanetByID: function(planetID) {
		var result = null;
		var _g1 = 0, _g = this._galaxy.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			var p = this._galaxy.content[i];
			if(p.id == planetID) {
				result = p;
				break;
			}
		}
		return result;
	}
	,isValidOrder: function(order,orderOwnerId) {
		var result = true;
		var source = this.getPlanetByID(order.sourceID);
		var target = this.getPlanetByID(order.targetID);
		if(source == null) {
			haxe.Log.trace("Invalid Order : source inconnue",{ fileName : "GameEngine.hx", lineNumber : 307, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			result = false;
		} else if(target == null) {
			haxe.Log.trace("Invalid Order : target inconnue",{ fileName : "GameEngine.hx", lineNumber : 312, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			result = false;
		} else if(source.population < order.numUnits) {
			haxe.Log.trace("Invalid Order : la planete ne possede pas suffisement d'unité",{ fileName : "GameEngine.hx", lineNumber : 317, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			haxe.Log.trace("Order sourcePoulation : " + source.population,{ fileName : "GameEngine.hx", lineNumber : 318, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			result = false;
		} else if(source.owner.id != orderOwnerId) {
			haxe.Log.trace("Invalid Order : le proprietaire de la planete n'est pas le meme que celui de l'ordre",{ fileName : "GameEngine.hx", lineNumber : 323, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			haxe.Log.trace("Order source owner id : " + source.owner.id,{ fileName : "GameEngine.hx", lineNumber : 324, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			result = false;
		}
		if(result == false) {
			haxe.Log.trace("Order Owner : " + orderOwnerId,{ fileName : "GameEngine.hx", lineNumber : 328, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			haxe.Log.trace("Order sourceID : " + order.sourceID,{ fileName : "GameEngine.hx", lineNumber : 329, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			haxe.Log.trace("Order targetID : " + order.targetID,{ fileName : "GameEngine.hx", lineNumber : 330, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
			haxe.Log.trace("Order numUnits : " + order.numUnits,{ fileName : "GameEngine.hx", lineNumber : 331, className : "com.tamina.planetwars.core.GameEngine", methodName : "isValidOrder"});
		}
		return result;
	}
	,createShipFromOrder: function(ordersOwner) {
		var orders = ordersOwner.get_turnOrders();
		var _g1 = 0, _g = orders.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = orders[i];
			var source = this.getPlanetByID(element.sourceID);
			var target = this.getPlanetByID(element.targetID);
			if(this.isValidOrder(element,ordersOwner.get_playerId())) {
				var s = new com.tamina.planetwars.data.Ship(element.numUnits,source,target,this._currentTurn);
				this._galaxy.fleet.push(s);
				bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"shipCreated",[s]);
				source.population -= element.numUnits;
				haxe.Log.trace("new ship from " + s.source.id + " to " + s.target.id + " with " + s.crew + " units. // travel duration  " + s.travelDuration + " // currentTurn " + this._currentTurn + " // current population " + s.target.population,{ fileName : "GameEngine.hx", lineNumber : 281, className : "com.tamina.planetwars.core.GameEngine", methodName : "createShipFromOrder"});
			} else if(ordersOwner.get_playerId() == this._player1.id) {
				this.playerOneScore = 0;
				this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player2,"Son adversaire a construit un ordre invalide",this._player1,this._player2,3));
			} else {
				this.playerTwoScore = 0;
				this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player1,"Son adversaire a construit un ordre invalide",this._player1,this._player2,3));
			}
		}
	}
	,endBattle: function(result) {
		this._turnTimer.stop();
		this._isComputing = false;
		this._endBattleDate = new Date();
		haxe.Log.trace("fin du match : joueur 1 = " + this.playerOneScore + "// joueur 2 = " + this.playerTwoScore,{ fileName : "GameEngine.hx", lineNumber : 259, className : "com.tamina.planetwars.core.GameEngine", methodName : "endBattle"});
		haxe.Log.trace("battle duration " + (this._endBattleDate.getTime() - this._startBattleDate.getTime()) / 1000 + " sec",{ fileName : "GameEngine.hx", lineNumber : 260, className : "com.tamina.planetwars.core.GameEngine", methodName : "endBattle"});
		bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"gameComplete",[result]);
	}
	,parseOrder: function() {
		var delta = Math.random() * 2 - 1;
		if(delta > 0) {
			this.createShipFromOrder(this._IA1);
			this.createShipFromOrder(this._IA2);
		} else {
			this.createShipFromOrder(this._IA2);
			this.createShipFromOrder(this._IA1);
		}
	}
	,updatePlayerScore: function() {
		this.playerOneScore = 0;
		this.playerTwoScore = 0;
		var playerOneNumUnits = 0;
		var playerTwoNumUnits = 0;
		var _g1 = 0, _g = this._galaxy.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			var p = this._galaxy.content[i];
			if(p.owner == this._player1) {
				this.playerOneScore += p.population;
				playerOneNumUnits++;
			} else if(p.owner == this._player2) {
				this.playerTwoScore += p.population;
				playerTwoNumUnits++;
			}
		}
		var _g1 = 0, _g = this._galaxy.fleet.length;
		while(_g1 < _g) {
			var i = _g1++;
			var s = this._galaxy.fleet[i];
			if(s.owner == this._player1) {
				this.playerOneScore += s.crew;
				playerOneNumUnits++;
			} else if(s.owner == this._player2) {
				this.playerTwoScore += s.crew;
				playerTwoNumUnits++;
			}
		}
		if(playerOneNumUnits == 0) this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player2,"Vainqueur par KO",this._player1,this._player2)); else if(playerTwoNumUnits == 0) this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player1,"Vainqueur par KO",this._player1,this._player2));
	}
	,computeCurrentTurn: function() {
		this.parseOrder();
		this.moveShips();
		this.increasePlanetGrowth();
		this.updatePlayerScore();
		bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnUpdate");
		this._currentTurn++;
		if(this._isComputing && this._currentTurn >= this._maxNumTurn) {
			if(this.playerOneScore > this.playerTwoScore) this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player1,"DUREE MAX ATTEINTE",this._player1,this._player2)); else this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player2,"DUREE MAX ATTEINTE",this._player1,this._player2));
		}
	}
	,resolveConflict: function(attacker,defender) {
		var result = attacker.crew - defender.population;
		if(attacker.owner == defender.owner) defender.population += attacker.crew; else if(result > 0) {
			defender.population = result;
			defender.owner = attacker.owner;
			haxe.Log.trace("planet captured by " + defender.owner.name + " with over " + Std.string(result),{ fileName : "GameEngine.hx", lineNumber : 160, className : "com.tamina.planetwars.core.GameEngine", methodName : "resolveConflict"});
		} else defender.population -= attacker.crew;
	}
	,moveShips: function() {
		if(this._galaxy.fleet.length > 0) {
			var i = this._galaxy.fleet.length;
			while(i-- > 0) {
				var s = this._galaxy.fleet[i];
				if(s.creationTurn + s.travelDuration <= this._currentTurn) {
					this.resolveConflict(s,s.target);
					this._galaxy.fleet.splice(i,1);
				}
			}
		}
	}
	,IA2_ordersResultHandler: function(event) {
		if(this._IA1.get_turnOrders() != null) this.computeCurrentTurn();
	}
	,IA1_ordersResultHandler: function(event) {
		if(this._IA2.get_turnOrders() != null) this.computeCurrentTurn();
	}
	,maxDuration_reachHandler: function(event) {
		haxe.Log.trace("max duration reached",{ fileName : "GameEngine.hx", lineNumber : 105, className : "com.tamina.planetwars.core.GameEngine", methodName : "maxDuration_reachHandler"});
		var playerId = event;
		if(playerId == this._player1.id) this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player2,"DUREE DU TOUR TROP LONGUE",this._player1,this._player2)); else this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player1,"DUREE DU TOUR TROP LONGUE",this._player1,this._player2));
	}
	,turnResultErrorHandler: function(event) {
		haxe.Log.trace("turn result error",{ fileName : "GameEngine.hx", lineNumber : 92, className : "com.tamina.planetwars.core.GameEngine", methodName : "turnResultErrorHandler"});
		var playerId = event;
		if(playerId == this._player1.id) this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player2,"RESULTAT DU TOUR INATTENDU",this._player1,this._player2)); else this.endBattle(new com.tamina.planetwars.data.BattleResult(this.playerOneScore,this.playerTwoScore,this._currentTurn,this._player1,"RESULTAT DU TOUR INATTENDU",this._player1,this._player2));
	}
	,retrieveIAOrders: function() {
		if(!this._IA1.isRunning() && !this._IA2.isRunning()) {
			this._IA1.init();
			this._IA2.init();
			this._IA1.send(this._galaxy);
			this._IA2.send(this._galaxy);
		}
	}
	,getBattleResult: function(player1,player2,galaxy,turnSpeed) {
		if(turnSpeed == null) turnSpeed = 1;
		haxe.Log.trace("init IA",{ fileName : "GameEngine.hx", lineNumber : 47, className : "com.tamina.planetwars.core.GameEngine", methodName : "getBattleResult"});
		this._IA1 = new com.tamina.planetwars.core.IA(new Worker(player1.script),player1.id);
		bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnResultComplete" + this._IA1.get_playerId(),$bind(this,this.IA1_ordersResultHandler));
		this._IA2 = new com.tamina.planetwars.core.IA(new Worker(player2.script),player2.id);
		bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnResultComplete" + this._IA2.get_playerId(),$bind(this,this.IA2_ordersResultHandler));
		bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnMaxDurationReach",$bind(this,this.maxDuration_reachHandler));
		bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnResultError",$bind(this,this.turnResultErrorHandler));
		haxe.Log.trace("start battle",{ fileName : "GameEngine.hx", lineNumber : 54, className : "com.tamina.planetwars.core.GameEngine", methodName : "getBattleResult"});
		this._maxNumTurn = 500;
		this._startBattleDate = new Date();
		this._currentTurn = 0;
		this._isComputing = true;
		this._player1 = player1;
		this._player2 = player2;
		this._galaxy = galaxy;
		this.playerOneScore = 100;
		this.playerTwoScore = 100;
		this._turnTimer = new haxe.Timer(turnSpeed);
		if(turnSpeed == 1) while(this._isComputing && this._currentTurn < this._maxNumTurn) this.computeCurrentTurn(); else this._turnTimer.run = $bind(this,this.retrieveIAOrders);
	}
	,__class__: com.tamina.planetwars.core.GameEngine
}
com.tamina.planetwars.core.GameEngineEvent = function() { }
com.tamina.planetwars.core.GameEngineEvent.__name__ = true;
com.tamina.planetwars.core.IA = function(worker,playerId) {
	this.init();
	this._playerId = playerId;
	this._woker = worker;
	this._woker.onmessage = $bind(this,this.worker_messageHandler);
	this._turnTimer = new haxe.Timer(10);
	this._turnTimer.run = $bind(this,this.maxDuration_reachHandler);
	this._startTime = 0;
};
com.tamina.planetwars.core.IA.__name__ = true;
com.tamina.planetwars.core.IA.prototype = {
	get_playerId: function() {
		return this._playerId;
	}
	,get_turnOrders: function() {
		return this._turnOrders;
	}
	,worker_messageHandler: function(message) {
		this._startTime = 0;
		if(message.data != null) {
			var turnResult = message.data;
			if(turnResult.consoleMessage.length > 0) haxe.Log.trace(turnResult.consoleMessage,{ fileName : "IA.hx", lineNumber : 69, className : "com.tamina.planetwars.core.IA", methodName : "worker_messageHandler"});
			this._turnOrders = turnResult.orders;
			bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnResultComplete" + this.get_playerId(),[message.data]);
		} else bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnResultError",[this.get_playerId()]);
	}
	,maxDuration_reachHandler: function() {
		if(this._startTime > 0) {
			var t0 = new Date().getTime();
			if(t0 - this._startTime > 1000) {
				haxe.Log.trace("maxDuration_reachHandler",{ fileName : "IA.hx", lineNumber : 55, className : "com.tamina.planetwars.core.IA", methodName : "maxDuration_reachHandler"});
				this._turnTimer.stop();
				this._turnTimer = null;
				bean.fire(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnMaxDurationReach",[this.get_playerId()]);
			}
		}
	}
	,isRunning: function() {
		return this._startTime > 0;
	}
	,send: function(data) {
		this._startTime = new Date().getTime();
		this._woker.postMessage(new com.tamina.planetwars.data.TurnMessage(this.get_playerId(),data));
	}
	,init: function() {
		this._turnOrders = null;
	}
	,__class__: com.tamina.planetwars.core.IA
}
com.tamina.planetwars.core.IAEvent = function() { }
com.tamina.planetwars.core.IAEvent.__name__ = true;
com.tamina.planetwars.core.UIElementId = function() { }
com.tamina.planetwars.core.UIElementId.__name__ = true;
com.tamina.planetwars.data = {}
com.tamina.planetwars.data.BattleResult = function(playerOneScore,playerTwoScore,numTurn,winner,message,p1,p2,errorCode) {
	if(errorCode == null) errorCode = 0;
	if(numTurn == null) numTurn = 0;
	if(playerTwoScore == null) playerTwoScore = 0;
	if(playerOneScore == null) playerOneScore = 0;
	this.playerOneScore = playerOneScore;
	this.playerTwoScore = playerTwoScore;
	this.numTurn = numTurn;
	this.winner = winner;
	this.message = message;
	this.p1 = p1;
	this.p2 = p2;
	this.errorCode = errorCode;
};
com.tamina.planetwars.data.BattleResult.__name__ = true;
com.tamina.planetwars.data.BattleResult.prototype = {
	__class__: com.tamina.planetwars.data.BattleResult
}
com.tamina.planetwars.data.ErrorCode = function() { }
com.tamina.planetwars.data.ErrorCode.__name__ = true;
com.tamina.planetwars.data.Galaxy = function(width,height) {
	this.width = width;
	this.height = height;
	this.content = new Array();
	this.fleet = new Array();
};
com.tamina.planetwars.data.Galaxy.__name__ = true;
com.tamina.planetwars.data.Galaxy.prototype = {
	contains: function(planetId) {
		var result = false;
		var _g1 = 0, _g = this.content.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.content[i].id == planetId) {
				result = true;
				break;
			}
		}
		return result;
	}
	,__class__: com.tamina.planetwars.data.Galaxy
}
com.tamina.planetwars.data.Game = function() { }
com.tamina.planetwars.data.Game.__name__ = true;
com.tamina.planetwars.data.Game.get_NUM_PLANET = function() {
	if(com.tamina.planetwars.data.Game.NUM_PLANET == null) com.tamina.planetwars.data.Game.NUM_PLANET = new com.tamina.planetwars.data.Range(5,10);
	return com.tamina.planetwars.data.Game.NUM_PLANET;
}
com.tamina.planetwars.data.Game.get_NEUTRAL_PLAYER = function() {
	if(com.tamina.planetwars.data.Game._NEUTRAL_PLAYER == null) com.tamina.planetwars.data.Game._NEUTRAL_PLAYER = new com.tamina.planetwars.data.Player("neutre",13421772);
	return com.tamina.planetwars.data.Game._NEUTRAL_PLAYER;
}
com.tamina.planetwars.data.IPlayer = function() { }
com.tamina.planetwars.data.IPlayer.__name__ = true;
com.tamina.planetwars.data.IPlayer.prototype = {
	__class__: com.tamina.planetwars.data.IPlayer
}
com.tamina.planetwars.data.Mock = function() {
};
com.tamina.planetwars.data.Mock.__name__ = true;
com.tamina.planetwars.data.Mock.prototype = {
	getGalaxy: function(width,height) {
		var p1 = new com.tamina.planetwars.ia.BasicIA("damo",16711680);
		var p2 = new com.tamina.planetwars.ia.BasicIA("moebius",65280);
		return com.tamina.planetwars.utils.GameUtil.createRandomGalaxy(width,height,20,p1,p2);
	}
	,__class__: com.tamina.planetwars.data.Mock
}
com.tamina.planetwars.data.Order = function(sourceID,targetID,numUnits) {
	this.sourceID = sourceID;
	this.targetID = targetID;
	this.numUnits = numUnits;
};
com.tamina.planetwars.data.Order.__name__ = true;
com.tamina.planetwars.data.Order.prototype = {
	__class__: com.tamina.planetwars.data.Order
}
com.tamina.planetwars.data.Planet = function(x,y,size,owner) {
	if(size == null) size = 2;
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
	this.size = size;
	this.owner = owner;
	this.population = com.tamina.planetwars.data.PlanetPopulation.getDefaultPopulation(size);
	this.id = Std.string(com.tamina.planetwars.utils.UID.get());
};
com.tamina.planetwars.data.Planet.__name__ = true;
com.tamina.planetwars.data.Planet.prototype = {
	__class__: com.tamina.planetwars.data.Planet
}
com.tamina.planetwars.data.PlanetPopulation = function() { }
com.tamina.planetwars.data.PlanetPopulation.__name__ = true;
com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
	case 1:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_SMALL;
		break;
	case 2:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_NORMAL;
		break;
	case 3:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_BIG;
		break;
	case 4:
		result = com.tamina.planetwars.data.PlanetPopulation.MAX_HUGE;
		break;
	}
	return result;
}
com.tamina.planetwars.data.PlanetPopulation.getDefaultPopulation = function(planetSize) {
	var result = 1;
	switch(planetSize) {
	case 1:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_SMALL;
		break;
	case 2:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_NORMAL;
		break;
	case 3:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_BIG;
		break;
	case 4:
		result = com.tamina.planetwars.data.PlanetPopulation.DEFAULT_HUGE;
		break;
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize = function() { }
com.tamina.planetwars.data.PlanetSize.__name__ = true;
com.tamina.planetwars.data.PlanetSize.getWidthBySize = function(size) {
	var result = 50;
	switch(size) {
	case 1:
		result = 20;
		break;
	case 2:
		result = 30;
		break;
	case 3:
		result = 50;
		break;
	case 4:
		result = 70;
		break;
	default:
		throw "Taille inconnue : " + Std.string(size);
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize.getExtensionBySize = function(size) {
	var result = "_big";
	switch(size) {
	case 1:
		result = "_small";
		break;
	case 2:
		result = "_normal";
		break;
	case 3:
		result = "_big";
		break;
	case 4:
		result = "_huge";
		break;
	default:
		throw "Taille inconnue : " + Std.string(size);
	}
	return result;
}
com.tamina.planetwars.data.PlanetSize.getRandomPlanetImageURL = function(size) {
	var result = "";
	var rdn = Math.round(Math.random() * 4);
	switch(rdn) {
	case 0:
		result = PlanetWars.BASE_URL + "images/jupiter" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 1:
		result = PlanetWars.BASE_URL + "images/lune" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 2:
		result = PlanetWars.BASE_URL + "images/mars" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 3:
		result = PlanetWars.BASE_URL + "images/neptune" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	case 4:
		result = PlanetWars.BASE_URL + "images/terre" + com.tamina.planetwars.data.PlanetSize.getExtensionBySize(size) + ".png";
		break;
	}
	return result;
}
com.tamina.planetwars.data.Player = function(name,color,script) {
	if(script == null) script = "";
	if(color == null) color = 0;
	if(name == null) name = "";
	this.name = name;
	this.color = color;
	this.script = script;
	this.id = Std.string(com.tamina.planetwars.utils.UID.get());
};
com.tamina.planetwars.data.Player.__name__ = true;
com.tamina.planetwars.data.Player.__interfaces__ = [com.tamina.planetwars.data.IPlayer];
com.tamina.planetwars.data.Player.prototype = {
	getOrders: function(context) {
		var result = new Array();
		return result;
	}
	,__class__: com.tamina.planetwars.data.Player
}
com.tamina.planetwars.data.Range = function(from,to) {
	if(to == null) to = 1;
	if(from == null) from = 0;
	this.from = from;
	this.to = to;
};
com.tamina.planetwars.data.Range.__name__ = true;
com.tamina.planetwars.data.Range.prototype = {
	__class__: com.tamina.planetwars.data.Range
}
com.tamina.planetwars.data.Ship = function(crew,source,target,creationTurn) {
	this.crew = crew;
	this.source = source;
	this.target = target;
	this.owner = source.owner;
	this.creationTurn = creationTurn;
	this.travelDuration = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
};
com.tamina.planetwars.data.Ship.__name__ = true;
com.tamina.planetwars.data.Ship.prototype = {
	__class__: com.tamina.planetwars.data.Ship
}
com.tamina.planetwars.data.TurnMessage = function(playerId,galaxy) {
	this.playerId = playerId;
	this.galaxy = galaxy;
};
com.tamina.planetwars.data.TurnMessage.__name__ = true;
com.tamina.planetwars.data.TurnMessage.prototype = {
	__class__: com.tamina.planetwars.data.TurnMessage
}
com.tamina.planetwars.data.TurnResult = function(orders,message) {
	if(message == null) message = "";
	this.orders = orders;
	this.consoleMessage = message;
	this.error = "";
};
com.tamina.planetwars.data.TurnResult.__name__ = true;
com.tamina.planetwars.data.TurnResult.prototype = {
	__class__: com.tamina.planetwars.data.TurnResult
}
com.tamina.planetwars.geom = {}
com.tamina.planetwars.geom.Point = function(x,y) {
	this.x = x;
	this.y = y;
};
com.tamina.planetwars.geom.Point.__name__ = true;
com.tamina.planetwars.geom.Point.prototype = {
	__class__: com.tamina.planetwars.geom.Point
}
com.tamina.planetwars.ia = {}
com.tamina.planetwars.ia.BasicIA = function(name,color) {
	if(color == null) color = 0;
	if(name == null) name = "";
	com.tamina.planetwars.data.Player.call(this,name,color);
};
com.tamina.planetwars.ia.BasicIA.__name__ = true;
com.tamina.planetwars.ia.BasicIA.__super__ = com.tamina.planetwars.data.Player;
com.tamina.planetwars.ia.BasicIA.prototype = $extend(com.tamina.planetwars.data.Player.prototype,{
	isAttackable: function(source,target) {
		var result = false;
		var numTurn = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
		var targetPopulation = target.population + numTurn * 5;
		if(targetPopulation > com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size)) targetPopulation = com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(target.size);
		if(source.population > targetPopulation) result = true;
		return result;
	}
	,getNearestAttackablePlanet: function(source,candidats) {
		var result = null;
		var currentDist = 10000;
		var _g1 = 0, _g = candidats.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = candidats[i];
			if(currentDist > com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y))) {
				currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y));
				if(this.isAttackable(source,element)) result = element;
			}
		}
		return result;
	}
	,getNearestPlanet: function(source,candidats) {
		var result = candidats[0];
		var currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(result.x,result.y));
		var _g1 = 0, _g = candidats.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = candidats[i];
			if(currentDist > com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y))) {
				currentDist = com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(element.x,element.y));
				result = element;
			}
		}
		return result;
	}
	,getOrders: function(context) {
		var result = new Array();
		var myPlanets = com.tamina.planetwars.utils.GameUtil.getPlayerPlanets(this.id,context);
		var otherPlanets = com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets(this.id,context);
		if(otherPlanets != null && otherPlanets.length > 0) {
			var _g1 = 0, _g = myPlanets.length;
			while(_g1 < _g) {
				var i = _g1++;
				var myPlanet = myPlanets[i];
				var target = this.getNearestAttackablePlanet(myPlanet,otherPlanets);
				if(target != null) result.push(new com.tamina.planetwars.data.Order(myPlanet.id,target.id,myPlanet.population)); else if(myPlanet.population == com.tamina.planetwars.data.PlanetPopulation.getMaxPopulation(myPlanet.size)) result.push(new com.tamina.planetwars.data.Order(myPlanet.id,this.getNearestPlanet(myPlanet,otherPlanets).id,myPlanet.population));
			}
		}
		return result;
	}
	,__class__: com.tamina.planetwars.ia.BasicIA
});
com.tamina.planetwars.ia.NoneIA = function(name,color) {
	if(color == null) color = 0;
	if(name == null) name = "";
	com.tamina.planetwars.data.Player.call(this,name,color);
};
com.tamina.planetwars.ia.NoneIA.__name__ = true;
com.tamina.planetwars.ia.NoneIA.__super__ = com.tamina.planetwars.data.Player;
com.tamina.planetwars.ia.NoneIA.prototype = $extend(com.tamina.planetwars.data.Player.prototype,{
	getOrders: function(context) {
		var result = new Array();
		return result;
	}
	,__class__: com.tamina.planetwars.ia.NoneIA
});
com.tamina.planetwars.server = {}
com.tamina.planetwars.server.BattleRenderer = function(canvas,width,height) {
	this._width = width;
	this._height = height;
	this._display = new com.tamina.planetwars.server.GalaxyRenderer(canvas,this._width,this._height);
	this._engine = new com.tamina.planetwars.core.GameEngine();
	bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"turnUpdate",$bind(this,this.turnUpdateHandler));
	bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"gameComplete",$bind(this,this.gameCompleteHandler));
	bean.on(com.tamina.planetwars.core.EventDispatcher.getInstance(),"shipCreated",$bind(this,this.shipCreatedHandler));
};
com.tamina.planetwars.server.BattleRenderer.__name__ = true;
com.tamina.planetwars.server.BattleRenderer.prototype = {
	shipCreatedHandler: function(event) {
		if(js.Boot.__instanceof(event,com.tamina.planetwars.data.Ship)) this._display.addShip(event); else throw "pas de vaisseau";
	}
	,gameCompleteHandler: function(event) {
		haxe.Log.trace("gameCompleteHandler",{ fileName : "BattleRenderer.hx", lineNumber : 75, className : "com.tamina.planetwars.server.BattleRenderer", methodName : "gameCompleteHandler"});
		if(js.Boot.__instanceof(event,com.tamina.planetwars.data.BattleResult)) {
			var result = event;
			this._display.showResultScreen(result.winner.name,result.message);
		} else throw "pas de vaisseau";
	}
	,turnUpdateHandler: function(event) {
		js.Browser.document.getElementById("playerOneScore").innerHTML = Std.string(this._engine.playerOneScore);
		js.Browser.document.getElementById("playerTwoScore").innerHTML = Std.string(this._engine.playerTwoScore);
		this._display.update();
	}
	,fightHandler: function(event) {
		this.start();
	}
	,start: function() {
		if(!this._engine.get_isComputing()) this._engine.getBattleResult(this._data.firstPlayerHome.owner,this._data.secondPlayerHome.owner,this._data,500); else haxe.Log.trace("battle already started",{ fileName : "BattleRenderer.hx", lineNumber : 60, className : "com.tamina.planetwars.server.BattleRenderer", methodName : "start"});
	}
	,init: function(firstPlayer,secondPlayer) {
		haxe.Log.trace("init battle",{ fileName : "BattleRenderer.hx", lineNumber : 46, className : "com.tamina.planetwars.server.BattleRenderer", methodName : "init"});
		this._data = com.tamina.planetwars.utils.GameUtil.createRandomGalaxy(this._width,this._height,20,firstPlayer,secondPlayer);
		this._display.set_data(this._data);
		js.Browser.document.getElementById("playerOneName").innerHTML = this._data.firstPlayerHome.owner.name;
		js.Browser.document.getElementById("playerTwoName").innerHTML = this._data.secondPlayerHome.owner.name;
		var fightButton = js.Browser.document.getElementById("fightButton");
		bean.on(fightButton,"click",$bind(this,this.fightHandler));
	}
	,__class__: com.tamina.planetwars.server.BattleRenderer
}
com.tamina.planetwars.server.GalaxyRenderer = function(display,width,height) {
	this._stage = new createjs.Stage(display);
	this._width = width;
	this._height = height;
	this._planetContainer = new createjs.Container();
	this._fleetContainer = new createjs.Container();
	this._backgroundBitmap = new createjs.Bitmap(PlanetWars.BASE_URL + "images/background.jpg");
	this._gridBitmap = new createjs.Bitmap(PlanetWars.BASE_URL + "images/grille.png");
	this._stage.addChild(this._backgroundBitmap);
	this._stage.addChild(this._gridBitmap);
	this._stage.addChild(this._planetContainer);
	this._stage.addChild(this._fleetContainer);
	createjs.Ticker.useRAF = true;
	createjs.Ticker.setFPS(com.tamina.planetwars.server.GalaxyRenderer.FPS);
	createjs.Ticker.addListener($bind(this,this.tickerHandler));
};
com.tamina.planetwars.server.GalaxyRenderer.__name__ = true;
com.tamina.planetwars.server.GalaxyRenderer.prototype = {
	tickerHandler: function() {
		this._stage.update();
	}
	,drawPlanets: function() {
		if(this._data != null) {
			var _g1 = 0, _g = this._data.content.length;
			while(_g1 < _g) {
				var i = _g1++;
				var item = new com.tamina.planetwars.server.PlanetSprite(this._data.content[i]);
				item.x = item.get_data().x;
				item.y = item.get_data().y;
				this._planetContainer.addChild(item);
			}
		}
	}
	,set_data: function(value) {
		this._data = value;
		this._planetContainer.removeAllChildren();
		this.drawPlanets();
		this._stage.update();
		return this._data;
	}
	,get_data: function() {
		return this._data;
	}
	,ship_targetReachedHandler: function(target) {
		this._fleetContainer.removeChild(target);
	}
	,update: function() {
		var _g1 = 0, _g = this._planetContainer.getNumChildren();
		while(_g1 < _g) {
			var i = _g1++;
			var item = this._planetContainer.getChildAt(i);
			if(js.Boot.__instanceof(item,com.tamina.planetwars.server.PlanetSprite)) {
				var sprite = item;
				sprite.update();
			}
		}
	}
	,showResultScreen: function(winner,resultMessage) {
		this._resultScreen = new com.tamina.planetwars.server.ResultScreen(winner,resultMessage);
		this._stage.addChild(this._resultScreen);
		this._resultScreen.x = Math.floor(this._width / 2 - this._resultScreen.getWidth() / 2);
		this._resultScreen.y = Math.floor(this._height / 2 - this._resultScreen.getHeight() / 2);
	}
	,addShip: function(value) {
		var item = new com.tamina.planetwars.server.ShipSprite(value);
		item.completeHandler = $bind(this,this.ship_targetReachedHandler);
		this._fleetContainer.addChild(item);
	}
	,stopRendering: function() {
	}
	,__class__: com.tamina.planetwars.server.GalaxyRenderer
}
com.tamina.planetwars.server.PlanetSprite = function(planet) {
	createjs.Container.call(this);
	this._data = planet;
	this._size = com.tamina.planetwars.data.PlanetSize.getWidthBySize(this._data.size);
	this._circleShape = new createjs.Shape();
	this._circleShape.alpha = 0.5;
	this.addChild(this._circleShape);
	this.updateCircle();
	this._planetBitmap = new createjs.Bitmap(com.tamina.planetwars.data.PlanetSize.getRandomPlanetImageURL(this._data.size));
	this.addChild(this._planetBitmap);
	this.updatePlanet();
	this._populationText = new createjs.Text(Std.string(this._data.population));
	this._populationText.y = -5;
	this.updatePopulationText();
	this.addChild(this._populationText);
};
com.tamina.planetwars.server.PlanetSprite.__name__ = true;
com.tamina.planetwars.server.PlanetSprite.__super__ = createjs.Container;
com.tamina.planetwars.server.PlanetSprite.prototype = $extend(createjs.Container.prototype,{
	updatePlanet: function() {
		this._planetBitmap.x = -Math.round(this._size / 2);
		this._planetBitmap.y = -Math.round(this._size / 2);
	}
	,updateCircle: function() {
		this._circleShape.graphics.clear();
		this._circleShape.graphics.beginFill("#" + StringTools.hex(this._data.owner.color,6));
		this._circleShape.graphics.drawCircle(0.0,0.0,Math.round(this._size / 2) + 4);
		this._circleShape.graphics.endFill();
	}
	,updatePopulationText: function() {
		this._populationText.text = Std.string(this._data.population);
		if(this._data.population >= 100) this._populationText.x = -10; else this._populationText.x = -5;
	}
	,set_data: function(value) {
		return this._data = value;
	}
	,get_data: function() {
		return this._data;
	}
	,update: function() {
		this.updatePopulationText();
		this.updateCircle();
	}
	,__class__: com.tamina.planetwars.server.PlanetSprite
});
com.tamina.planetwars.server.ResultScreen = function(winner,message) {
	createjs.Container.call(this);
	this._backgroundShape = new createjs.Shape();
	this.addChild(this._backgroundShape);
	this._backgroundShape.graphics.clear();
	this._backgroundShape.graphics.beginFill("#CCCCCC");
	this._backgroundShape.graphics.drawRoundRect(0.0,0.0,400.0,250.0,0.0);
	this._backgroundShape.graphics.endFill();
	this._trophyBitmap = new createjs.Bitmap(PlanetWars.BASE_URL + "images/trophy.png");
	this.addChild(this._trophyBitmap);
	this._trophyBitmap.y = 61.;
	this._trophyBitmap.x = 20.0;
	this._winnerText = new createjs.Text(winner + " WIN","bold 36px Arial");
	this._winnerText.maxWidth = 400.0;
	this._winnerText.textAlign = "center";
	this._winnerText.x = 200.;
	this._winnerText.y = 20.0;
	this.addChild(this._winnerText);
	this._messageText = new createjs.Text(message);
	this._messageText.lineWidth = 220.;
	this._messageText.lineHeight = 20.0;
	this._messageText.x = 180.0;
	this._messageText.y = 100.0;
	this.addChild(this._messageText);
};
com.tamina.planetwars.server.ResultScreen.__name__ = true;
com.tamina.planetwars.server.ResultScreen.__super__ = createjs.Container;
com.tamina.planetwars.server.ResultScreen.prototype = $extend(createjs.Container.prototype,{
	getHeight: function() {
		return 250.0;
	}
	,getWidth: function() {
		return 400.0;
	}
	,__class__: com.tamina.planetwars.server.ResultScreen
});
com.tamina.planetwars.server.ShipSprite = function(ship) {
	createjs.Container.call(this);
	this._data = ship;
	this.x = this._data.source.x;
	this.y = this._data.source.y;
	this._shipBitmap = new createjs.Bitmap(PlanetWars.BASE_URL + "images/ship.png");
	this.addChild(this._shipBitmap);
	this._shipBitmap.x = -5;
	this._shipBitmap.y = -5;
	this._tween = createjs.Tween.get(this).to(new com.tamina.planetwars.geom.Point(this._data.target.x,this._data.target.y),this._data.travelDuration * 500).call($bind(this,this.tweenCompleteHandler));
	this._quadShape = new createjs.Shape();
	this._quadShape.alpha = 0.5;
	this._quadShape.graphics.clear();
	this._quadShape.graphics.beginFill("#" + StringTools.hex(this._data.owner.color,6));
	this._quadShape.graphics.drawRoundRect(-7.0,-15.0,19.0,10.0,0.0);
	this._quadShape.graphics.endFill();
	this.addChild(this._quadShape);
	this._populationText = new createjs.Text(Std.string(this._data.crew));
	this._populationText.y = -16;
	this._populationText.x = -7;
	this._populationText.color = "#FFFFFF";
	this.addChild(this._populationText);
};
com.tamina.planetwars.server.ShipSprite.__name__ = true;
com.tamina.planetwars.server.ShipSprite.__super__ = createjs.Container;
com.tamina.planetwars.server.ShipSprite.prototype = $extend(createjs.Container.prototype,{
	set_data: function(value) {
		return this._data = value;
	}
	,get_data: function() {
		return this._data;
	}
	,tweenCompleteHandler: function(tween) {
		this.completeHandler(this);
	}
	,completeHandler: function(target) {
	}
	,__class__: com.tamina.planetwars.server.ShipSprite
});
com.tamina.planetwars.utils = {}
com.tamina.planetwars.utils.GameUtil = function() { }
com.tamina.planetwars.utils.GameUtil.__name__ = true;
com.tamina.planetwars.utils.GameUtil.getDistanceBetween = function(p1,p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}
com.tamina.planetwars.utils.GameUtil.getPlayerPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id == planetOwnerId) result.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getEnnemyFleet = function(playerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.fleet.length;
	while(_g1 < _g) {
		var i = _g1++;
		var s = context.fleet[i];
		if(s.owner.id != playerId) result.push(s);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getTravelNumTurn = function(source,target) {
	var numTurn = Math.ceil(com.tamina.planetwars.utils.GameUtil.getDistanceBetween(new com.tamina.planetwars.geom.Point(source.x,source.y),new com.tamina.planetwars.geom.Point(target.x,target.y)) / 60);
	return numTurn;
}
com.tamina.planetwars.utils.GameUtil.getEnnemyPlanets = function(planetOwnerId,context) {
	var result = new Array();
	var _g1 = 0, _g = context.content.length;
	while(_g1 < _g) {
		var i = _g1++;
		var p = context.content[i];
		if(p.owner.id != planetOwnerId) result.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.createRandomGalaxy = function(width,height,padding,playerOne,playerTwo) {
	var result = new com.tamina.planetwars.data.Galaxy(width,height);
	if(playerOne != null) {
		result.firstPlayerHome = new com.tamina.planetwars.data.Planet(padding * 2,padding * 2,3,playerOne);
		result.firstPlayerHome.population = 100;
		result.content.push(result.firstPlayerHome);
	}
	if(playerTwo != null) {
		result.secondPlayerHome = new com.tamina.planetwars.data.Planet(width - padding * 2,height - padding * 2,3,playerTwo);
		result.secondPlayerHome.population = 100;
		result.content.push(result.secondPlayerHome);
	}
	var numPlanet = Math.floor(com.tamina.planetwars.data.Game.get_NUM_PLANET().from + Math.floor(Math.random() * (com.tamina.planetwars.data.Game.get_NUM_PLANET().to - com.tamina.planetwars.data.Game.get_NUM_PLANET().from)));
	var colNumber = Math.floor((result.width - 280) / 70);
	var rawNumber = Math.floor((result.height - 140) / 70);
	var avaiblePositions = new Array();
	var _g1 = 0, _g = colNumber * rawNumber;
	while(_g1 < _g) {
		var i = _g1++;
		avaiblePositions.push(i);
	}
	var _g = 0;
	while(_g < numPlanet) {
		var i = _g++;
		var pos = com.tamina.planetwars.utils.GameUtil.getNewPosition(result,avaiblePositions,colNumber);
		var p = new com.tamina.planetwars.data.Planet(pos.x,pos.y,Math.ceil(Math.random() * 4),com.tamina.planetwars.data.Game.get_NEUTRAL_PLAYER());
		result.content.push(p);
	}
	return result;
}
com.tamina.planetwars.utils.GameUtil.getNewPosition = function(currentGalaxy,avaiblePositions,colNumber) {
	var result;
	var index = Math.floor(Math.random() * avaiblePositions.length);
	var caseNumber = avaiblePositions[index];
	avaiblePositions.splice(index,1);
	var columIndex = caseNumber % colNumber;
	var rawIndex = Math.ceil(caseNumber / colNumber);
	result = new com.tamina.planetwars.geom.Point((columIndex + 2) * 70,(rawIndex + 1) * 70);
	return result;
}
com.tamina.planetwars.utils.UID = function() { }
com.tamina.planetwars.utils.UID.__name__ = true;
com.tamina.planetwars.utils.UID.get = function() {
	if(com.tamina.planetwars.utils.UID._lastUID == null) com.tamina.planetwars.utils.UID._lastUID = 0;
	com.tamina.planetwars.utils.UID._lastUID++;
	return com.tamina.planetwars.utils.UID._lastUID;
}
var haxe = {}
haxe.Http = function(url) {
	this.url = url;
	this.headers = new haxe.ds.StringMap();
	this.params = new haxe.ds.StringMap();
	this.async = true;
};
haxe.Http.__name__ = true;
haxe.Http.prototype = {
	onStatus: function(status) {
	}
	,onError: function(msg) {
	}
	,onData: function(data) {
	}
	,request: function(post) {
		var me = this;
		me.responseData = null;
		var r = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s = (function($this) {
				var $r;
				try {
					$r = r.status;
				} catch( e ) {
					$r = null;
				}
				return $r;
			}(this));
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) me.onData(me.responseData = r.responseText); else if(s == null) me.onError("Failed to connect or resolve host"); else switch(s) {
			case 12029:
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.onError("Unknown host");
				break;
			default:
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.keys();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += StringTools.urlEncode(p) + "=" + StringTools.urlEncode(this.params.get(p));
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e ) {
			this.onError(e.toString());
			return;
		}
		if(this.headers.get("Content-Type") == null && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.keys();
		while( $it1.hasNext() ) {
			var h = $it1.next();
			r.setRequestHeader(h,this.headers.get(h));
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,setParameter: function(param,value) {
		this.params.set(param,value);
		return this;
	}
	,__class__: haxe.Http
}
haxe.Log = function() { }
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.prototype = {
	run: function() {
		haxe.Log.trace("run",{ fileName : "Timer.hx", lineNumber : 98, className : "haxe.Timer", methodName : "run"});
	}
	,stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,__class__: haxe.Timer
}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0, _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
js.Browser = function() { }
js.Browser.__name__ = true;
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
}
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
com.tamina.planetwars.core.EventType.CLICK = "click";
com.tamina.planetwars.core.GameEngineEvent.TURN_UPDATE = "turnUpdate";
com.tamina.planetwars.core.GameEngineEvent.SHIP_CREATED = "shipCreated";
com.tamina.planetwars.core.GameEngineEvent.GAME_COMPLETE = "gameComplete";
com.tamina.planetwars.core.IAEvent.TURN_RESULT_COMPLETE = "turnResultComplete";
com.tamina.planetwars.core.IAEvent.TURN_RESULT_ERROR = "turnResultError";
com.tamina.planetwars.core.IAEvent.TURN_MAX_DURATION_REACH = "turnMaxDurationReach";
com.tamina.planetwars.core.UIElementId.APPLICATION_CANVAS = "applicationCanvas";
com.tamina.planetwars.core.UIElementId.PLAYER_ONE_NAME = "playerOneName";
com.tamina.planetwars.core.UIElementId.PLAYER_TWO_NAME = "playerTwoName";
com.tamina.planetwars.core.UIElementId.FIGHT_BUTTON = "fightButton";
com.tamina.planetwars.core.UIElementId.PLAYER_ONE_SCORE = "playerOneScore";
com.tamina.planetwars.core.UIElementId.PLAYER_TWO_SCORE = "playerTwoScore";
com.tamina.planetwars.data.BattleResult.NONE = 0;
com.tamina.planetwars.data.BattleResult.LOOSE = 1;
com.tamina.planetwars.data.BattleResult.WIN = 2;
com.tamina.planetwars.data.ErrorCode.NONE = 0;
com.tamina.planetwars.data.ErrorCode.EXCEPTION = 1;
com.tamina.planetwars.data.ErrorCode.HACKER = 2;
com.tamina.planetwars.data.ErrorCode.INVALID_ORDER = 3;
com.tamina.planetwars.data.Game.DEFAULT_PLAYER_POPULATION = 100;
com.tamina.planetwars.data.Game.PLANET_GROWTH = 5;
com.tamina.planetwars.data.Game.SHIP_SPEED = 60;
com.tamina.planetwars.data.Game.MAX_TURN_DURATION = 1000;
com.tamina.planetwars.data.Game.GAME_SPEED = 500;
com.tamina.planetwars.data.Game.GAME_DURATION = 240;
com.tamina.planetwars.data.Game.GAME_MAX_NUM_TURN = 500;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_SMALL = 20;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_NORMAL = 30;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_BIG = 40;
com.tamina.planetwars.data.PlanetPopulation.DEFAULT_HUGE = 50;
com.tamina.planetwars.data.PlanetPopulation.MAX_SMALL = 50;
com.tamina.planetwars.data.PlanetPopulation.MAX_NORMAL = 100;
com.tamina.planetwars.data.PlanetPopulation.MAX_BIG = 200;
com.tamina.planetwars.data.PlanetPopulation.MAX_HUGE = 300;
com.tamina.planetwars.data.PlanetSize.SMALL = 1;
com.tamina.planetwars.data.PlanetSize.NORMAL = 2;
com.tamina.planetwars.data.PlanetSize.BIG = 3;
com.tamina.planetwars.data.PlanetSize.HUGE = 4;
com.tamina.planetwars.data.PlanetSize.SMALL_WIDTH = 20;
com.tamina.planetwars.data.PlanetSize.NORMAL_WIDTH = 30;
com.tamina.planetwars.data.PlanetSize.BIG_WIDTH = 50;
com.tamina.planetwars.data.PlanetSize.HUGE_WIDTH = 70;
com.tamina.planetwars.data.PlanetSize.SMALL_EXTENSION = "_small";
com.tamina.planetwars.data.PlanetSize.NORMAL_EXTENSION = "_normal";
com.tamina.planetwars.data.PlanetSize.BIG_EXTENSION = "_big";
com.tamina.planetwars.data.PlanetSize.HUGE_EXTENSION = "_huge";
com.tamina.planetwars.server.GalaxyRenderer.FPS = 30.0;
com.tamina.planetwars.server.ResultScreen.WIDTH = 400.0;
com.tamina.planetwars.server.ResultScreen.HEIGHT = 250.0;
js.Browser.window = typeof window != "undefined" ? window : null;
js.Browser.document = typeof window != "undefined" ? window.document : null;
PlanetWars.main();
function $hxExpose(src, path) {
	var o = typeof window != "undefined" ? window : exports;
	var parts = path.split(".");
	for(var ii = 0; ii < parts.length-1; ++ii) {
		var p = parts[ii];
		if(typeof o[p] == "undefined") o[p] = {};
		o = o[p];
	}
	o[parts[parts.length-1]] = src;
}
})();

//@ sourceMappingURL=PlanetWarsHaxeJS.js.map