name = "Wopatak"
color = 0

debugMessage = ''

id = 0
enemyId = -1

# @internal method
@onmessage = (event) ->
  if event.data?
    turnMessage = event.data
    id = turnMessage.playerId
    postMessage( new TurnResult( getOrders(turnMessage.galaxy), debugMessage) )
  else postMessage("data null")

# @model Galaxy
# @param width:Number largeur de la galaxy
# @param height:Number hauteur de la galaxy
class Galaxy
  constructor: (@width,@height) ->
    ###contenu : liste Planet###
    @content = []
    ###flote : liste de Ship###
    @fleet = []

# @model Range
# @param from:Number début de l'intervale
# @param to:Number fin de l'intervale
class Range
  constructor: (@from,@to) ->

# @model Order
# @param sourceID:Number id de la planete d'origine
# @param targetID:Number id de la planete cible
# @param numUnits:Number nombre d'unité à déplacer
class Order
  constructor: (@sourceID,@targetID,@numUnits) ->

# @model Planet
# @param x:Number position en x
# @param y:Number position en y
# @param size:Number taille
# @param owner:Player proprietaire
class Planet
  constructor: (@x,@y,@size,@owner) ->
    ### population###
    @population = PlanetPopulation.getDefaultPopulation(size);
    ### id ###
    @id = UID.get();


# @model Ship
# @param crew:Number equipage
# @param source:Planet origine
# @param target:Planet cible
# @param creationTurn:Number numero du tour de creation du vaisseau
class Ship
  constructor: (@crew,@source,@target,@creationTurn) ->
    ### proprietaire du vaisseau###
    @owner = source.owner;
    ### duree du voyage en nombre de tour###
    @travelDuration = Math.ceil(GameUtil.getDistanceBetween(new Point(source.x,source.y),new Point(target.x,target.y)) / Game.SHIP_SPEED);

# @internal model
class TurnMessage
  constructor: (@playerId,@galaxy) ->

# @internal model
class TurnResult
  constructor: (@orders,@consoleMessage = "") ->
    @error = ""

# @model Point
# @param x:Number
# @param y:Number
class Point
  constructor: (@x,@y) ->

# Classe utilitaire
class GameUtil
  # @param p1:Point
  # @param p2:Point
  # @return result:Number la distance entre deux points
  @getDistanceBetween : (p1,p2) ->
    Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2))

  # @param planetOwnerId:Number
  # @param context:Galaxy
  # @return result:Array<Planet> la liste des planetes appartenants à un joueur en particulier
  @getPlayerPlanets: (planetOwnerId,context) ->
    result = []
    for p in context.content
      if p.owner.id == planetOwnerId
        result.push p
    return result
  # @param planetOwnerId:Number
  # @param context:Galaxy
  # @return result:Array<Planet> la liste des planetes ennemies et neutres
  @getEnnemyPlanets : (planetOwnerId,context) ->
    result = []
    for p in context.content
      if p.owner.id != planetOwnerId
        result.push p
    return result

# Classe utilitaire
# @internal
class UID
  @lastUID : 0
  @get : () ->
    UID.lastUID++
    return UID.lastUID

# Constantes
class Game
  @DEFAULT_PLAYER_POPULATION : 100;
  @NUM_PLANET : new Range(5,10);
  @PLANET_GROWTH : 5;
  @SHIP_SPEED : 60;
  @GAME_SPEED : 500;
  @GAME_DURATION : 240;
  @GAME_MAX_NUM_TURN : 500;

class PlanetPopulation
  @DEFAULT_SMALL : 20;
  @DEFAULT_NORMAL : 30;
  @DEFAULT_BIG : 40;
  @DEFAULT_HUGE : 50;
  @MAX_SMALL : 50;
  @MAX_NORMAL : 100;
  @MAX_BIG : 200;
  @MAX_HUGE : 300;
  @getMaxPopulation : (planetSize) ->
    result = 1
    switch planetSize
      when PlanetSize.SMALL then result = PlanetPopulation.MAX_SMALL
      when PlanetSize.NORMAL then result = PlanetPopulation.MAX_NORMAL
      when PlanetSize.BIG then result = PlanetPopulation.MAX_BIG
      when PlanetSize.HUGE then result = PlanetPopulation.MAX_HUGE
    return result

  @getDefaultPopulation : (planetSize) ->
    result = 1;
    switch planetSize
      when PlanetSize.SMALL then result = PlanetPopulation.DEFAULT_SMALL
      when PlanetSize.NORMAL then result = PlanetPopulation.DEFAULT_NORMAL
      when PlanetSize.BIG then result = PlanetPopulation.DEFAULT_BIG
      when PlanetSize.HUGE then result = PlanetPopulation.DEFAULT_HUGE
    return result

class PlanetSize
  @SMALL : 1
  @NORMAL : 2
  @BIG : 3
  @HUGE : 4

shuffle = (o) -> #v1.0
  j = undefined
  x = undefined
  i = o.length

  while i
    j = Math.floor(Math.random() * i)
    x = o[--i]
    o[i] = o[j]
    o[j] = x
  o

# Invoquée tous les tours pour recuperer la liste des ordres à exécuter.
# C'est la methode à modifier pour cabler son IA.
# @param context:Galaxy
# @return result:Array<Order>
getOrders = (context) ->
  result = []
  myPlanets = GameUtil.getPlayerPlanets id, context
  otherPlanets = GameUtil.getEnnemyPlanets id, context
  enemyId = getOtherPlayerId(id, context) if enemyId < 0
  enemyPlanets = getOtherPlayerPlanets enemyId, context

  if enemyPlanets != null && enemyPlanets.length > 0 && otherPlanets != null && otherPlanets.length > 0
    for myPlanet in myPlanets
      otherPipo = shuffle(otherPlanets).slice 0, 5
      enemyPipo = shuffle(enemyPlanets).slice 0, 5
      pipoPlanets = [otherPipo, enemyPipo]
      pipoPlanets = [].concat.apply [], pipoPlanets

      for pipo in pipoPlanets
        result.push new Order myPlanet.id, pipo.id, 0

      currentPopulation = myPlanet.population
      if currentPopulation >= 5
        result.push new Order( myPlanet.id, getNearestPlanet(myPlanet, enemyPlanets).id, currentPopulation - 5 ) if currentPopulation - 5 != 0
        currentPopulation -= 5

  return result;

getOtherPlayerId = (id, context) ->
  planets = GameUtil.getEnnemyPlanets id, context
  planets[0].owner.id

getNearestPlanet = ( source, candidats ) ->
  result = candidats[ 0 ]
  currentDist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( result.x, result.y ) )
  for element in candidats
    dist = GameUtil.getDistanceBetween( new Point( source.x, source.y ), new Point( element.x, element.y ) )
    if  currentDist > dist
      currentDist = dist
      result = element
  return result

getOtherPlayerPlanets = (id, context) ->
  planets = []
  for planet in context.content
    planets.push planet if planet.owner.id == id
  planets
